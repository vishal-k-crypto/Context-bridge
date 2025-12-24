'use client'

import { forwardRef, useMemo, useEffect } from 'react'
import { Uniform, Vector2 } from 'three'
import { Effect } from 'postprocessing'

const fragmentShader = `
uniform float frequency;
uniform float amplitude;
uniform vec2 mouse;
uniform float time;
uniform float speed;
uniform float distortion;

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
    vec2 aspectCorrection = vec2(1.7, 1.0); 
    float dist = distance(uv * aspectCorrection, mouse * aspectCorrection);
    float strength = smoothstep(0.4, 0.0, dist);
    vec2 wave = vec2(
        sin(uv.y * frequency + time * speed),
        cos(uv.x * frequency + time * speed)
    );
    vec2 newUV = uv + (wave * strength * distortion * amplitude);
    outputColor = texture2D(inputBuffer, newUV);
}
`

interface LiquidEffectProps {
    frequency?: number
    amplitude?: number
    speed?: number
    distortion?: number
}

// Implementation of the Effect class from postprocessing
export class LiquidEffectImpl extends Effect {
    constructor({ frequency = 10, amplitude = 0.05, speed = 2, distortion = 0 }: LiquidEffectProps) {
        super(
            'LiquidEffect',
            fragmentShader,
            {
                uniforms: new Map<string, Uniform>([
                    ['frequency', new Uniform(frequency)],
                    ['amplitude', new Uniform(amplitude)],
                    ['time', new Uniform(0)],
                    ['speed', new Uniform(speed)],
                    ['mouse', new Uniform(new Vector2(0.5, 0.5))],
                    ['distortion', new Uniform(distortion)]
                ]),
            }
        )
    }

    update(renderer: any, inputBuffer: any, deltaTime: number) {
        const time = this.uniforms.get('time')
        if (time) time.value += deltaTime
    }
}

// React wrapper using primitive to avoid wrapEffect issues
export const LiquidEffect = forwardRef<LiquidEffectImpl, LiquidEffectProps>((props, ref) => {
    // Memoize the effect instance so it doesn't re-create on every render
    const effect = useMemo(() => new LiquidEffectImpl(props), [])

    // Update uniforms when props change (except distortion which is animated by frame)
    useEffect(() => {
        if (props.frequency !== undefined) effect.uniforms.get('frequency')!.value = props.frequency
        if (props.amplitude !== undefined) effect.uniforms.get('amplitude')!.value = props.amplitude
        if (props.speed !== undefined) effect.uniforms.get('speed')!.value = props.speed
    }, [effect, props.frequency, props.amplitude, props.speed])

    return <primitive ref={ref} object={effect} dispose={null} />
})

LiquidEffect.displayName = 'LiquidEffect'
