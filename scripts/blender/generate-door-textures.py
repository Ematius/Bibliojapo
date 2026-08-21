"""Genera las texturas de dorso, canto y bisagra de las puertas de la biblioteca.

Uso (headless, sin interfaz):
  blender --background --python generate-door-textures.py -- <output_dir>

Requisitos aprendidos en la sesión anterior:
- view_transform debe ser "Standard" (AgX desatura los colores).
- Los inputs "Base Color" son lineales: los tokens de diseño (hex sRGB) se
  convierten con hex_to_linear() antes de asignarlos.
- La cámara ortográfica necesita sensor_fit explícito ("VERTICAL") y
  ortho_scale igual a la altura real de la geometría — "AUTO" deja márgenes
  enormes en renders verticales.
- primitive_cube_add(size=1) ya crea una arista de 1 unidad: el factor de
  escala del objeto es el tamaño final directamente, sin dividir entre 2.
- El metal solo responde a luz especular: necesita mucha más energía que la
  madera o se ve plano y negro.
"""

import bpy
import math
import os
import sys

DOOR_ASPECT = 423.0 / 158.8  # alto/ancho real de la hoja de puerta

COLOR_WOOD = "#8b5e3c"
COLOR_WOOD_DARK = "#5c3a1e"
COLOR_WOOD_DEEP = "#3a2210"
COLOR_INK = "#2c1f0e"

OVERSCAN = 0.985  # recorta un poco el encuadre para que el bisel nunca deje ver el fondo


def hex_to_linear(hex_color):
    value = hex_color.lstrip("#")
    channels = []
    for i in (0, 2, 4):
        c = int(value[i : i + 2], 16) / 255.0
        c = c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
        channels.append(c)
    return tuple(channels)


def clear_scene():
    for obj in list(bpy.data.objects):
        bpy.data.objects.remove(obj, do_unlink=True)


def setup_render(width_px, height_px, samples=96, transparent=False):
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = samples
    scene.cycles.use_denoising = True
    scene.render.resolution_x = width_px
    scene.render.resolution_y = height_px
    scene.render.film_transparent = transparent
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA" if transparent else "RGB"
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.view_settings.exposure = 0.0
    scene.view_settings.gamma = 1.0

    world = bpy.data.worlds.get("DoorTextureWorld") or bpy.data.worlds.new("DoorTextureWorld")
    world.use_nodes = True
    bg = world.node_tree.nodes.get("Background")
    if bg:
        bg.inputs["Color"].default_value = (0.02, 0.017, 0.014, 1.0)
        bg.inputs["Strength"].default_value = 0.5
    scene.world = world


def add_camera(distance, ortho_scale, sensor_fit="VERTICAL"):
    cam_data = bpy.data.cameras.new("RenderCam")
    cam_data.type = "ORTHO"
    cam_data.ortho_scale = ortho_scale * OVERSCAN
    cam_data.sensor_fit = sensor_fit
    cam_obj = bpy.data.objects.new("RenderCam", cam_data)
    bpy.context.collection.objects.link(cam_obj)
    cam_obj.location = (0, 0, distance)
    cam_obj.rotation_euler = (0, 0, 0)
    bpy.context.scene.camera = cam_obj
    return cam_obj


def add_area_light(location, energy, size, rotation):
    light_data = bpy.data.lights.new("Light", type="AREA")
    light_data.energy = energy
    light_data.size = size
    light_obj = bpy.data.objects.new("Light", light_data)
    bpy.context.collection.objects.link(light_obj)
    light_obj.location = location
    light_obj.rotation_euler = rotation
    return light_obj


def setup_lighting():
    # Luz clave rasante desde arriba-izquierda: es la que revela el relieve
    # de los paneles tallados (sin ella el bisel no proyecta sombra/brillo).
    # Energía baja a propósito: la escena mide ~1-3 unidades y la luz está
    # muy cerca, así que vatios altos sobreexponen y lavan el color a pastel.
    add_area_light((-1.6, -1.1, 2.4), energy=22, size=1.1, rotation=(math.radians(55), 0, math.radians(-35)))
    # Luz de relleno frontal suave, evita negros puros en las zonas hundidas.
    add_area_light((0.4, -0.3, 2.8), energy=7, size=2.2, rotation=(math.radians(20), 0, math.radians(10)))


def setup_lighting_metal():
    # El metal solo se ve por reflejo especular (sin respuesta difusa), así
    # que necesita mucha más energía que la madera para que el brillo no
    # se quede plano y negro.
    add_area_light((-1.2, -0.9, 2.2), energy=260, size=0.6, rotation=(math.radians(55), 0, math.radians(-35)))
    add_area_light((0.5, -0.4, 2.6), energy=50, size=1.8, rotation=(math.radians(20), 0, math.radians(10)))


def make_wood_material(name, base_color, dark_color, roughness=0.55, grain_scale=5.0, bump_strength=0.12):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    nodes.clear()

    out = nodes.new("ShaderNodeOutputMaterial")
    out.location = (700, 0)
    bsdf = nodes.new("ShaderNodeBsdfPrincipled")
    bsdf.location = (400, 0)
    bsdf.inputs["Roughness"].default_value = roughness
    links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    coord = nodes.new("ShaderNodeTexCoord")
    coord.location = (-900, 0)
    mapping = nodes.new("ShaderNodeMapping")
    mapping.location = (-700, 0)
    # Vetas alargadas en el sentido de la hoja: más frecuencia en X (ancho),
    # menos en Y (alto) — así las líneas de veta corren a lo largo de la puerta.
    mapping.inputs["Scale"].default_value = (grain_scale * 1.6, grain_scale, grain_scale)
    links.new(coord.outputs["Object"], mapping.inputs["Vector"])

    wave = nodes.new("ShaderNodeTexWave")
    wave.location = (-400, 260)
    wave.inputs["Scale"].default_value = 2.0
    wave.inputs["Distortion"].default_value = 1.6
    wave.inputs["Detail"].default_value = 2.0
    links.new(mapping.outputs["Vector"], wave.inputs["Vector"])

    noise_fine = nodes.new("ShaderNodeTexNoise")
    noise_fine.location = (-400, 60)
    noise_fine.inputs["Scale"].default_value = 6.5
    noise_fine.inputs["Detail"].default_value = 6.0
    noise_fine.inputs["Roughness"].default_value = 0.65
    links.new(mapping.outputs["Vector"], noise_fine.inputs["Vector"])

    noise_broad = nodes.new("ShaderNodeTexNoise")
    noise_broad.location = (-400, -160)
    noise_broad.inputs["Scale"].default_value = 2.2
    noise_broad.inputs["Detail"].default_value = 3.0
    links.new(mapping.outputs["Vector"], noise_broad.inputs["Vector"])

    # El ruido domina la mezcla (Fac 0.85) para que el grano se vea orgánico
    # en vez de bandas regulares tipo "cartón corrugado".
    combine = nodes.new("ShaderNodeMixRGB")
    combine.location = (-120, 160)
    combine.blend_type = "MIX"
    combine.inputs["Fac"].default_value = 0.85
    links.new(noise_fine.outputs["Fac"], combine.inputs["Color1"])
    links.new(wave.outputs["Fac"], combine.inputs["Color2"])

    ramp = nodes.new("ShaderNodeValToRGB")
    ramp.location = (100, 160)
    ramp.color_ramp.elements[0].position = 0.15
    ramp.color_ramp.elements[0].color = (*dark_color, 1.0)
    ramp.color_ramp.elements[1].position = 0.85
    ramp.color_ramp.elements[1].color = (*base_color, 1.0)
    links.new(combine.outputs["Color"], ramp.inputs["Fac"])

    tone = nodes.new("ShaderNodeMixRGB")
    tone.location = (280, 100)
    tone.blend_type = "MULTIPLY"
    tone.inputs["Fac"].default_value = 0.18
    links.new(ramp.outputs["Color"], tone.inputs["Color1"])
    links.new(noise_broad.outputs["Color"], tone.inputs["Color2"])
    links.new(tone.outputs["Color"], bsdf.inputs["Base Color"])

    bump = nodes.new("ShaderNodeBump")
    bump.location = (120, -160)
    bump.inputs["Strength"].default_value = bump_strength
    links.new(wave.outputs["Fac"], bump.inputs["Height"])
    links.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

    return mat


def make_metal_material(name, base_color, roughness=0.28, metallic=0.9):
    mat = bpy.data.materials.new(name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (*base_color, 1.0)
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = metallic
    return mat


def add_beveled_box(name, size, location, material, bevel_width=0.008, bevel_segments=3):
    bpy.ops.mesh.primitive_cube_add(size=1, location=location)
    obj = bpy.context.active_object
    obj.name = name
    # primitive_cube_add(size=1) ya crea una arista de 1 unidad -> el factor
    # de escala es el tamaño final directamente, sin dividir entre 2.
    obj.scale = (size[0], size[1], size[2])
    bpy.ops.object.transform_apply(scale=True)
    bevel = obj.modifiers.new("Bevel", "BEVEL")
    bevel.width = bevel_width
    bevel.segments = bevel_segments
    bevel.harden_normals = True
    obj.data.materials.append(material)
    return obj


def render_carved_back_panel(output_path, width_px, height_px):
    clear_scene()
    setup_render(width_px, height_px, samples=96, transparent=False)

    board_w = 1.0
    board_h = DOOR_ASPECT
    board_depth = 0.05
    panel_offset = 0.035  # cuánto sobresalen los paneles tallados hacia la cámara
    stile = 0.11  # margen lateral (montante)
    top_rail = 0.14
    bottom_rail = 0.14
    mid_rail = 0.09  # travesaño central entre los dos paneles

    wood = make_wood_material(
        "door_back_wood",
        hex_to_linear(COLOR_WOOD_DARK),
        hex_to_linear(COLOR_WOOD_DEEP),
        roughness=0.6,
        grain_scale=4.5,
        bump_strength=0.09,
    )

    add_beveled_box("board", (board_w, board_h, board_depth), (0, 0, 0), wood, bevel_width=0.006, bevel_segments=2)

    inner_w = board_w - 2 * stile
    usable_h = board_h - top_rail - bottom_rail - mid_rail
    panel1_h = usable_h * 0.36
    panel2_h = usable_h * 0.64

    half_h = board_h / 2
    panel1_top = half_h - top_rail
    panel1_center = panel1_top - panel1_h / 2
    panel2_top = panel1_top - panel1_h - mid_rail
    panel2_center = panel2_top - panel2_h / 2

    panel_z = board_depth / 2 + panel_offset / 2
    add_beveled_box("panel_top", (inner_w, panel1_h, panel_offset), (0, panel1_center, panel_z), wood, bevel_width=0.012, bevel_segments=3)
    add_beveled_box("panel_bottom", (inner_w, panel2_h, panel_offset), (0, panel2_center, panel_z), wood, bevel_width=0.012, bevel_segments=3)

    setup_lighting()
    add_camera(distance=4.0, ortho_scale=board_h, sensor_fit="VERTICAL")

    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)


def render_edge_strip(output_path, width_px, height_px):
    clear_scene()
    setup_render(width_px, height_px, samples=64, transparent=False)

    strip_w = 1.0
    strip_h = 3.0
    strip_depth = 0.06

    wood = make_wood_material(
        "door_edge_wood",
        hex_to_linear(COLOR_WOOD),
        hex_to_linear(COLOR_WOOD_DARK),
        roughness=0.5,
        grain_scale=7.0,
        bump_strength=0.14,
    )
    add_beveled_box("edge", (strip_w, strip_h, strip_depth), (0, 0, 0), wood, bevel_width=0.03, bevel_segments=4)

    setup_lighting()
    add_camera(distance=4.0, ortho_scale=strip_h, sensor_fit="VERTICAL")

    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)


def render_hinge_plate(output_path, width_px, height_px):
    clear_scene()
    setup_render(width_px, height_px, samples=64, transparent=True)

    plate_w = 1.0
    plate_h = plate_w * (height_px / width_px)
    plate_depth = 0.05

    metal = make_metal_material("hinge_metal", hex_to_linear(COLOR_WOOD_DEEP))
    add_beveled_box("hinge_plate", (plate_w, plate_h, plate_depth), (0, 0, 0), metal, bevel_width=0.015, bevel_segments=3)

    screw_r = plate_h * 0.16
    screw_depth = plate_depth * 1.4
    for offset_y in (plate_h * 0.28, -plate_h * 0.28):
        bpy.ops.mesh.primitive_cylinder_add(radius=screw_r, depth=screw_depth, location=(0, offset_y, plate_depth / 2))
        screw = bpy.context.active_object
        screw.name = "screw"
        bevel = screw.modifiers.new("Bevel", "BEVEL")
        bevel.width = screw_r * 0.15
        bevel.segments = 2
        bevel.harden_normals = True
        screw.data.materials.append(metal)

    setup_lighting_metal()
    add_camera(distance=4.0, ortho_scale=plate_h, sensor_fit="VERTICAL")

    bpy.context.scene.render.filepath = output_path
    bpy.ops.render.render(write_still=True)


def main():
    argv = sys.argv
    argv = argv[argv.index("--") + 1 :] if "--" in argv else []
    if not argv:
        raise SystemExit("Uso: blender --background --python generate-door-textures.py -- <output_dir>")
    output_dir = argv[0]
    os.makedirs(output_dir, exist_ok=True)

    back_w_px = 768
    back_h_px = round(back_w_px * DOOR_ASPECT)

    render_carved_back_panel(os.path.join(output_dir, "door-back-texture.png"), back_w_px, back_h_px)
    render_edge_strip(os.path.join(output_dir, "door-edge-texture.png"), 192, 576)
    render_hinge_plate(os.path.join(output_dir, "door-hinge.png"), 96, 300)


main()
