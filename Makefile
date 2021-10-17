CC = emcc
CFLAGS = -O3 --no-entry -s EXPORTED_FUNCTIONS='["_malloc"]'

all: sine.wasm

.SUFFIXES: .wasm
.c.wasm:
	${CC} ${CFLAGS} -o $@ $<

clean:
	rm -f *.wasm

.PHONY: clean
