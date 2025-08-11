'use client'

import { useContext, useEffect, useState } from 'react'
import { Pagination } from 'swiper/modules'
import Image from 'next/image'

import 'swiper/css'
import 'swiper/css/pagination'

import * as S from './AnimalDetailsPage.styles'
import { Button } from '@/components/Button'
import { AnimalsContext } from '@/contexts/animals'
import { Animal } from '@/@types/animal'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react'
import Link from 'next/link'
import { getCookie } from 'cookies-next'
import { insertUserChat } from '@/api/insert-user-chat'

export function AnimalDetailsPage() {
  const [animal, setAnimal] = useState<Animal | null>(null)
  const params = useParams<{ id: string }>()
  const { getAnimalById } = useContext(AnimalsContext)
  const router = useRouter()

  useEffect(() => {
    const getAnimalResponse = getAnimalById(params.id)
    setAnimal(getAnimalResponse)
  }, [getAnimalById, params.id])

  const handleContactAnimalOwner = async () => {
    try {
      const token = getCookie('token') || ''
      const response = await insertUserChat(animal?.userId || '', token)

      if (response.status !== 201) {
        alert('Ocorreu um erro ao contatar o dono, por favor tente novamente')
        return
      }

      const chatId = response.data.chat.id
      router.push(`/area_logada/conversas/${chatId}`)
    } catch (err) {
      console.error('Falha ao tentar iniciar o chat:', err)
      alert(
        'Não foi possível contatar o dono no momento. Por favor, tente novamente mais tarde.',
      )
    }
  }

  if (!animal) return <span>Carregando...</span>

  return (
    <S.Wrapper>
      <S.GoBackButtonWrapper>
        <Link href="/area_logada/animais_disponiveis">
          <ArrowLeft size={32} />
        </Link>
      </S.GoBackButtonWrapper>
      <S.ContentWrapper>
        <S.AnimalPicturesWrapper>
          <S.AnimalPicturesSwiper
            spaceBetween={10}
            slidesPerView={1}
            modules={[Pagination]}
            pagination={{ clickable: true }}
          >
            {animal.images.map((image) => (
              <S.AnimalPictureSwiperSlide key={image}>
                <Image
                  src={`data:image/jpeg;base64,${image}`}
                  alt="Animal"
                  fill={true}
                  objectFit="cover"
                />
              </S.AnimalPictureSwiperSlide>
            ))}
          </S.AnimalPicturesSwiper>
        </S.AnimalPicturesWrapper>

        <S.AnimalInfoWrapper>
          <S.AnimalTitleWrapper>
            <h1>{animal.name}</h1>
            <span>
              {animal.type} | {animal.gender} | {animal.race ?? 'SRD'}
            </span>
          </S.AnimalTitleWrapper>

          <S.AnimalDescriptionWrapper>
            <span>Descrição</span>
            <span>{animal.description ?? 'N/D'}</span>
          </S.AnimalDescriptionWrapper>

          <Button type="button" onClick={handleContactAnimalOwner}>
            Entrar em contato com o dono
          </Button>
        </S.AnimalInfoWrapper>
      </S.ContentWrapper>
    </S.Wrapper>
  )
}