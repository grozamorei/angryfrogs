
const matrixIdentity = PIXI.Matrix.IDENTITY

export class HackMeshRenderer extends PIXI.mesh.MeshRenderer {
    constructor(renderer) {
        super(renderer);
    }

    /**
     * @override
     */
    onContextChange() {
        const gl = this.renderer.gl
        this.shader = new PIXI.Shader(gl,
            window.resources.getJSON('shader.vert.mesh'),
            window.resources.getJSON('shader.frag.slice3'))
    }

    /**
     * @override
     * @param mesh
     */
    render(mesh) {
        const renderer = this.renderer;
        const gl = renderer.gl;
        const texture = mesh._texture;

        if (!texture.valid)
        {
            return;
        }

        let glData = mesh._glDatas[renderer.CONTEXT_UID];

        if (!glData)
        {
            renderer.bindVao(null);

            glData = {
                shader: this.shader,
                vertexBuffer: PIXI.glCore.GLBuffer.createVertexBuffer(gl, mesh.vertices, gl.STREAM_DRAW),
                uvBuffer: PIXI.glCore.GLBuffer.createVertexBuffer(gl, mesh.uvs, gl.STREAM_DRAW),
                indexBuffer: PIXI.glCore.GLBuffer.createIndexBuffer(gl, mesh.indices, gl.STATIC_DRAW),
                // build the vao object that will render..
                vao: null,
                dirty: mesh.dirty,
                indexDirty: mesh.indexDirty,
            };

            // build the vao object that will render..
            glData.vao = new PIXI.glCore.VertexArrayObject(gl)
                .addIndex(glData.indexBuffer)
                .addAttribute(glData.vertexBuffer, glData.shader.attributes.aVertexPosition, gl.FLOAT, false, 2 * 4, 0)
                .addAttribute(glData.uvBuffer, glData.shader.attributes.aBounds, gl.FLOAT, false, 2 * 4, 0);

            mesh._glDatas[renderer.CONTEXT_UID] = glData;
        }

        renderer.bindVao(glData.vao);

        if (mesh.dirty !== glData.dirty)
        {
            glData.dirty = mesh.dirty;
            glData.uvBuffer.upload(mesh.uvs);
        }

        if (mesh.indexDirty !== glData.indexDirty)
        {
            glData.indexDirty = mesh.indexDirty;
            glData.indexBuffer.upload(mesh.indices);
        }

        glData.vertexBuffer.upload(mesh.vertices);

        renderer.bindShader(glData.shader);

        glData.shader.uniforms.uSampler = renderer.bindTexture(texture);

        renderer.state.setBlendMode(PIXI.utils.correctBlendMode(mesh.blendMode, texture.baseTexture.premultipliedAlpha));

        if (glData.shader.uniforms.uTransform)
        {
            if (mesh.uploadUvTransform)
            {
                glData.shader.uniforms.uTransform = mesh._uvTransform.mapCoord.toArray(true);
            }
            else
            {
                glData.shader.uniforms.uTransform = matrixIdentity.toArray(true);
            }
        }
        glData.shader.uniforms.translationMatrix = mesh.worldTransform.toArray(true);

        glData.shader.uniforms.uColor = PIXI.utils.premultiplyRgba(mesh.tintRgb,
            mesh.worldAlpha, glData.shader.uniforms.uColor, texture.baseTexture.premultipliedAlpha);


        this.shader.uniforms.edgeScale = [32/mesh.width, 32/mesh.height];
        const drawMode = mesh.drawMode === PIXI.mesh.Mesh.DRAW_MODES.TRIANGLE_MESH ? gl.TRIANGLE_STRIP : gl.TRIANGLES;

        glData.vao.draw(drawMode, mesh.indices.length, 0);
    }
}

PIXI.WebGLRenderer.registerPlugin('hackMesh', HackMeshRenderer)