attribute vec2 aVertexPosition;
attribute vec2 aBounds;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform mat3 uTransform;

varying vec2 vBounds;

void main(void)
{
    gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    vBounds = aBounds;
}