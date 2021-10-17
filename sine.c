/* sine.c: sine oscillator in c */
#include <emscripten.h>
#include <math.h>
#include <stdlib.h>
#define PI_F 3.14159265f

/* frame quanta defined by web audio */
#define NFRAMES 128

typedef struct {
  float phs;
  float invsr;
} Sine;

EMSCRIPTEN_KEEPALIVE Sine *
sine_init(float sr)
{
  Sine* self;

  self = calloc(1, sizeof(Sine));
  self->phs = 0;
  self->invsr = 1 / sr;

  return self;
}

EMSCRIPTEN_KEEPALIVE void
sine_process(Sine *self, float freq, float *out)
{
  size_t i;
  float phs;

  phs = self->phs;

  for (i = 0; i < NFRAMES; ++i) {
    out[i] = 0.1f * sinf(2*PI_F*phs);
    phs += freq * self->invsr;
    while (phs >= 1) phs--;
  }

  self->phs = phs;
}

/* technically not needed, javascript doesn't have
 * destructors, so this is never going to be called */
EMSCRIPTEN_KEEPALIVE void
sine_free(Sine *self)
{
  free(self);
}
