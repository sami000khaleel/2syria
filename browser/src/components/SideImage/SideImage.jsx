import React from 'react'
import { SyrianFlag } from '../Brand/Brand'
import vector0 from '../../assets/Vector.png'
import vector1 from '../../assets/Vector (1).png'
import vector2 from '../../assets/Vector (2).png'
import vector3 from '../../assets/Vector (3).png'
import vector4 from '../../assets/Vector (4).png'
import vector5 from '../../assets/Vector (5).png'
import illustration from '../../assets/招聘矢量插画人物场景插画招聘1100924黑与白-01 copy 1.png'

const SideImage = () => {
  return (
<figure className="relative hidden h-screen w-full overflow-hidden bg-gradient-to-br from-brand-400 via-brand-600 to-brand-900 md:grid place-content-center">
            {/* soft glows */}
            <span aria-hidden className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 animate-drift rounded-full bg-brand-200/40 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 animate-drift rounded-full bg-star-500/20 blur-3xl [animation-delay:-7s]" />
            <img
              src={vector0}
              className="absolute top-0 -left-[20%] opacity-20 mix-blend-luminosity"
              width={250}
              height={300}
              alt="vector"
            />
            <img
              src={vector1}
              className="absolute top-[0] left-[20%] opacity-20 mix-blend-luminosity"
              width={200}
              height={200}
              alt="vector"
            />
            <img
              src={vector2}
              className="absolute top-[30%] right-[0] opacity-20 mix-blend-luminosity"
              width={150}
              height={150}
              alt="vector"
            />
            <img
              src={vector3}
              className="absolute top-[20%] -left-[20%] opacity-20 mix-blend-luminosity"
              width={300}
              height={150}
              alt="vector"
            />
            <img
              src={vector4}
              className="absolute top-[60%] -left-[20%] opacity-20 mix-blend-luminosity"
              width={200}
              height={150}
              alt="vector"
            />
            <img
              src={vector5}
              className="absolute bottom-[0] right-[0] opacity-20 mix-blend-luminosity"
              width={200}
              height={150}
              alt="vector"
            />
            <div className="relative z-40 mx-auto flex w-[min(78%,440px)] flex-col items-center gap-8">
              <div className="w-full animate-float rounded-[2rem] bg-white/95 p-6 shadow-2xl shadow-black/30 ring-1 ring-white/40">
                <img
                  src={illustration}
                  className="m-auto aspect-auto w-[100%]"
                  width={200}
                  height={150}
                  alt="vector"
                />
              </div>
              <figcaption className="stagger flex flex-col items-center gap-3 text-center text-white">
                <SyrianFlag className="h-10 w-[60px] rounded-md shadow-lg ring-1 ring-white/30" />
                <p className="text-3xl font-extrabold tracking-tight">discover syria</p>
                <p className="max-w-xs text-sm text-white/75">search places, read reviews and find your way — even from a single photo.</p>
              </figcaption>
            </div>
          </figure>  )
}

export default SideImage
