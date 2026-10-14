# Mi escritorio — el diseño

> Documento de diseño, no de código. Define QUÉ hay sobre la mesa y qué abre cada
> cosa. Las reglas que se derivan de aquí y que valen para todo el proyecto están
> en `CLAUDE.md`, fase 3.

---

## 1. La idea

Una mesa vista desde el asiento, con **objetos encima**. Cada objeto es una
puerta. No hay estantería personal: repetir el mueble del pasillo sería enseñar
dos veces lo mismo.

**La mesa se va poblando, y eso ES el progreso.** Un objeto aparece cuando se gana
lo que representa. Sin cuenta la mesa está desnuda y solo se ofrece entrar; al
crearla aparecen los objetos que correspondan. Ni barras, ni «3 de 12»: lo que se
ve es tu mesa llenándose.

La escena está en `public/images/desk/`, medida en `src/desk/deskSpots.ts`.

---

## 2. Los tres objetos

| Objeto | Abre | Existe hoy |
|---|---|---|
| 🪪 **El carné** | Cuánto llevas recorrido | la cuenta, sí; el recorrido, no |
| 📄 **La hoja** | El árbol de chuletas | no |
| 🎲 **La caja** | Los juegos | no |

Los tres comparten el mismo gesto de apertura: **el objeto se levanta** de la mesa
y se pone delante. No es una pantalla nueva que sustituye a la mesa — es el objeto
que te acercas a la cara. La mesa sigue detrás.

---

## 3. El carné — cuánto llevas recorrido

Se levanta y enseña, de un vistazo, **qué parte del japonés del N5 llevas**:

- % de hiragana
- % de katakana
- % de kanji
- % de vocabulario N5

Los cuatro suben al **sellar el examen final** de un tomo, y solo entonces: cerrar
el tomo 1 pone el primer tramo de hiragana y su parte de vocabulario. Cada tomo
nuevo suma.

### Reglas

- **Los porcentajes se DERIVAN, nunca se escriben.** Salen de los bloques
  sellados, contando sus kana y sus palabras contra el total de cada silabario y
  contra el vocabulario N5 — igual que las cuentas de la portada de un tomo salen
  de `wordIds` y `sentenceIds`. Escritos a mano se desfasarían al primer cambio
  del temario.
- **Nada se cuenta dos veces.** Es la regla de reutilización del temario: un kana
  ya aprendido no vuelve a sumar porque aparezca en otro bloque.
- **Los totales son del temario, no inventados.** Hiragana 46 base y 110 formas;
  el vocabulario N5, unas 800 palabras. Están en `docs/estructura-aprendizaje.md`.

### Sin decidir

**Qué se hace con lo que está a cero.** Durante mucho tiempo katakana y kanji
estarán al 0 %, y cuatro barras vacías desaniman en vez de animar. Tres salidas
posibles: enseñar solo lo empezado; enseñarlas todas pero como camino por recorrer
y no como carencia; o enseñar el silabario en curso grande y el resto en pequeño.
Se decide al diseñar el carné, mirándolo.

---

## 4. La hoja — el árbol de chuletas

Se levanta y sale un **árbol interactivo**:

```text
Hiragana ─┬─ Tomo 1  ✔ desbloqueado
          ├─ Tomo 2  ✖ apagado
          └─ …
Katakana ─── (todavía no)
Kanji ────── (todavía no)
```

Se entra solo en lo desbloqueado; lo demás sale apagado, y se va encendiendo a
medida que se aprueban tomos.

### Reglas

- **Una chuleta se genera del bloque, nunca se escribe a mano.** Hermana de
  `buildVolumePages`.
- **Sale del paquete de `fetchVolume`, no de `content/`**, porque del tomo 2 en
  adelante el contenido es de pago y no puede viajar en el bundle.
- **Qué está desbloqueado lo dice el servidor**, nunca el navegador: es la misma
  regla que abre los tomos en la balda.

### Sin decidir

Si una rama entera sin empezar —katakana, kanji— **aparece apagada o no aparece**.
Apagada dice «esto llegará», que es bueno; pero tres ramas apagadas y una viva
hacen que la viva parezca pequeña.

## 5. Esto es grande, y va por partes

El escritorio completo es media aplicación más: tres aperturas, un árbol, un
abanico y un escenario por juego. Se hace **poco a poco y sin prisa**, y este es el
orden que no obliga a rehacer nada:

1. **La mesa y sus objetos**, quietos y pulsables. Ya medida.
2. **Entrar y crear cuenta desde la mesa**, para poder verla poblada. *(hecho)*
3. **El gesto de levantar un objeto**, uno solo y compartido por los tres: si cada
   uno estrena el suyo, habrá tres animaciones que mantener.
4. **El carné**, que es el único cuyo contenido se puede calcular hoy.
5. **La hoja y su árbol**, cuando haya al menos una chuleta que enseñar.
6. **La caja y su abanico**, cuando haya un juego decidido.
7. **El primer juego y su escenario.**

Lo que manda el orden es siempre lo mismo: **una puerta no se abre antes de que
haya algo detrás**. Un objeto cuyo destino todavía no existe puede estar en la mesa
—si se ha ganado— pero al pulsarlo dice «todavía no», nunca se rompe.
