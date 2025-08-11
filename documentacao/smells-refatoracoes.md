# Code Smells e Refatorações - Adote Fácil

## SonarQube Cloud

Realizamos a integração do repositório no GitHub com o **SonarQube Cloud** para detectar *code smells* no código. A ferramenta identificou **trinta e seis** problemas, dos quais **quatorze** são de gravidade média, **vinte e cinco** de gravidade baixa e **dois** onde não há impacto significativo na aplicação.

![codesmells](images/codesmells.png)

## Codes Smells

### 1. Operadores ternários não devem ser aninhados

- Linha 81 até a linha 93 do arquivo *frontend/src/app/area_logada/animais_disponiveis/AvailableAnimalsPage.tsx*
- Operadores ternários aninhados são difíceis de ler e podem tornar a ordem das operações complexa de entender. Em vez disso, é recomendável usar outra linha para expressar a operação aninhada em uma instrução separada.
- Qualidade de software impactada: manutenibilidade
- Nível: médio

```typescript
      ) : availableAnimals.length ? (
        <S.AnimalsListWrapper>
          {availableAnimals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              listType="animals-available-to-adopt"
            />
          ))}
        </S.AnimalsListWrapper>
      ) : (
        <EmptyAnimals page="animals-available-to-adopt" />
      )}
```

#### Refatoração

Este código utiliza a abordagem recomendada de criar uma função auxiliar (renderAnimalList) para lidar com a lógica de renderização, tornando o JSX principal mais limpo e o componente mais fácil de ler e manter.

```typescript
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
```

### 2. Exceção não tratadas

- Linha 46 do arquivo *frontend/src/app/area_logada/animais_disponiveis/[id]/AnimalDetailsPage.tsx*
- Quando ocorrem exceções, geralmente é uma má ideia simplesmente ignorá-las. Em vez disso, é melhor tratá-las adequadamente, ou pelo menos registrá-las.
- Qualidade de software impactada: manutenibilidade
- Nível: baixo

```typescript
catch (err) {}
```

#### Refatoração

```typescript
} catch (err) {
      console.error('Falha ao tentar iniciar o chat:', err)

      alert('Não foi possível contatar o dono no momento. Por favor, tente novamente mais tarde.')
    }
}
```

### 3. Array index em chaves

- Linha 67 do arquivo *frontend/src/app/area_logada/animais_disponiveis/[id]/AnimalDetailsPage.tsx*
- Para otimizar a renderização dos componentes de lista do React, é necessário um identificador único (UID) para cada item da lista. Este UID permite que o React identifique o item ao longo de sua vida útil. Evite índices de array é uma boa prática, pois a ordem dos itens pode mudar, o que fará com que as chaves não correspondam entre as renderizações, recriando o DOM. Isso pode impactar negativamente o desempenho e causar problemas com o estado do componente.
- Qualidade de software impactada: manutenibilidade
- Nível: médio

```typescript
{animal.images.map((image, index) => (
    <S.AnimalPictureSwiperSlide key={index}>
    <Image
        src={`data:image/jpeg;base64,${image}`}
        alt="Animal"
        fill={true}
        objectFit="cover"
    />
    </S.AnimalPictureSwiperSlide>
))}
```

#### Refatoração

```typescript
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
```

A *key* de cada imagem na lista foi corrigida. Em vez de usar o índice da sua posição no array, agora usamos a própria string da imagem como um identificador único. Isso melhora a performance, evita bugs e segue a forma recomendada pelo React.

