varying vec2 vBounds;

uniform sampler2D uSampler;
uniform vec4 uColor;
uniform vec2 edgeScale;

void main() {
    if (edgeScale.x < edgeScale.y) {
        if (1.0 - abs(edgeScale.y) < 0.01) { // horizontal 3slice
            vec2 toSample;
            if (vBounds.x <= edgeScale.x) { // left ear
                toSample = vBounds/edgeScale;
                toSample.x /= 2.0;
            } else if (vBounds.x >= (1.0 - edgeScale.x)) { // right ear
                toSample = (vec2(1.0, 1.0) - vBounds)/edgeScale;
                toSample.x /= 2.0;
                toSample.y = 1.0-toSample.y;
            } else {
                float startFrom = floor(vBounds.x / edgeScale.x) * edgeScale.x;
                toSample = vec2(0.5 + ((vBounds.x - startFrom)/edgeScale.x)/2.0, vBounds.y);
            }
            gl_FragColor = texture2D(uSampler, toSample);
        }
    } else {
    }
}
