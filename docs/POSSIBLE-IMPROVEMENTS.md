# Possible improvements

Ideas raised and deliberately parked, with the reasoning that put them here.
Nothing on this list is a defect — each is a judgement call the operator has
already weighed once.

## ULD Layout Generator

### Filtering and sorting the generated layouts — *parked*

Compartment 2 of the B777-300 produces **4147 layouts**, ~35 500 export rows in
all. Nobody reads that list.

Parked because the operator's system takes the whole file in one upload and no
one picks a layout by eye. Filtering in Excel covers the occasional need.

Worth revisiting the moment a person has to choose a layout from the list — at
that point it stops being cosmetic and becomes the most urgent improvement in
the tool. Likely shape: filter by "has PLA at 21", by position count, or by
total capacity, plus sorting by something other than generation order.

### Index and CG totals — *parked*

The tool produces indices but never sums them. With the actual ULD weights of a
flight it could show the total index of a layout and its contribution to the
centre of gravity, turning it from a feeder for the upload system into
something a load planner uses directly. Every input for that is already in the
data model.

Parked as outside current needs.

### Importing a manual's table by pasting it — *rejected*

Proposed as the biggest time saver, since building a template means transcribing
tables by hand (and that is where the mis-transcribed PLA index and the
contradictory PKC screenshots came from).

Rejected by the operator, with good reason: airlines publish these tables in
many different shapes, and FWD/AFT are often not in them at all. Starting from a
template and editing gets there more reliably than parsing an unpredictable
document. Do not resurrect this without a concrete, repeating source format.

## Elsewhere

### `.comp-tab` is shared between two meanings

In the ULD panel the class marks compartment tabs **and** the `+ Compartment`
button; in the Airline Message Toolkit it marks the PRL/PAXLST/PNL tabs. Nothing
misbehaves — the click handlers key off `data-act` — but a selector written
against the class alone reaches all three, which cost time while writing browser
tests. Splitting the classes would make automation less error-prone.
