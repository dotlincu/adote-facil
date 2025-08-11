'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { useContext, useEffect, useState } from 'react'
import { getCookie } from 'cookies-next'

import { Button } from '@/components/Button'
import { AnimalCard } from '@/components/AnimalCard'
import { EmptyAnimals } from '@/components/EmptyAnimals'
import { DefaultDialog } from '@/components/DefaultDialog'
import { AnimalsContext } from '@/contexts/animals'
import { getAvailableAnimals } from '@/api/get-available-animals'
import {
  AnimalFilterForm,
  AnimalFilterFormData,
} from '@/components/AnimalFilterForm'

import * as S from './AvailableAnimalsPage.styles'

export function AvailableAnimalsPage() {
  const { availableAnimals, setAvailableAnimals } = useContext(AnimalsContext)
  const [filter, setFilter] = useState<AnimalFilterFormData | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAvailableAnimals = async () => {
      setLoading(true)
      const token = getCookie('token')

      try {
        const response = await getAvailableAnimals(filter, token || '')
        if (response.status === 200) {
          setAvailableAnimals(response.data.animals)
        }
      } catch (error) {
        console.error("Falha ao buscar animais:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAvailableAnimals()
  }, [setAvailableAnimals, filter])

  const handleFilterAvailableAnimals = (data: AnimalFilterFormData) => {
    setFilter(data)
  }

  const handleRemoveFilters = () => {
    setFilter(null)
  }

  const renderAnimalList = () => {
    if (loading) {
      return <p>Carregando...</p>
    }

    if (availableAnimals.length > 0) {
      return (
        <S.AnimalsListWrapper>
          {availableAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              listType="animals-available-to-adopt"
            />
          ))}
        </S.AnimalsListWrapper>
      )
    }

    return <EmptyAnimals page="animals-available-to-adopt" />
  }

  return (
    <S.Wrapper>
      <S.TitleWrapper>
        <h1>Animais disponíveis para adoção</h1>
        {(!!availableAnimals.length || filter) && (
          <S.FilterButtonsWrapper>
            {filter && (
              <Button onClick={handleRemoveFilters} buttonStyle="red-filled">
                Limpar filtros
              </Button>
            )}

            <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
              <Dialog.Trigger asChild>
                <Button onClick={() => setDialogOpen(true)}>Filtrar</Button>
              </Dialog.Trigger>
              <DefaultDialog>
                <Dialog.DialogTitle>Filtros</Dialog.DialogTitle>
                <AnimalFilterForm
                  handleFilterAvailableAnimals={handleFilterAvailableAnimals}
                  closeDialog={() => setDialogOpen(false)}
                />
              </DefaultDialog>
            </Dialog.Root>
          </S.FilterButtonsWrapper>
        )}
      </S.TitleWrapper>

      {/* A função auxiliar é chamada aqui para renderizar o conteúdo dinâmico */}
      {renderAnimalList()}
    </S.Wrapper>
  )
}