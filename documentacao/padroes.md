# Princípios e Padrões de Projeto - Adote Fácil

Este documento detalha a aplicação de princípios de design e padrões de projeto no backend do sistema Adote Fácil, com exemplos práticos extraídos do código-fonte.

## 1. Princípios SOLID

A arquitetura do projeto foi construída sobre os pilares dos princípios SOLID, garantindo a separação de responsabilidades e o baixo acoplamento entre os módulos.

### Princípio da Responsabilidade Única (SRP)

O SRP é um dos princípios mais visíveis na arquitetura, que segmenta as responsabilidades em camadas bem definidas: `Controllers`, `Services` e `Repositories`.

- **Controllers:** Responsáveis unicamente por gerenciar o ciclo da requisição HTTP (receber dados, validar formato, chamar serviços e retornar a resposta).
- **Services:** Responsáveis por orquestrar a lógica de negócio e as regras da aplicação.
- **Repositories:** Responsáveis unicamente pelo acesso e manipulação dos dados no banco de dados.

**Exemplo Prático: `CreateAnimalController`**

O controller abaixo demonstra claramente o SRP. Sua única responsabilidade é atuar como um "maestro" da requisição, sem se envolver com a lógica de negócio de como um animal é de fato criado.

```typescript
// src/controllers/animal/create-animal.ts
class CreateAnimalController {
  constructor(private readonly createAnimal: CreateAnimalService) {}

  async handle(request: Request, response: Response): Promise<Response> {
    // 1. Extrai e adapta dados da camada HTTP
    const { name, type, gender, race, description } = request.body
    const { user } = request
    const pictures = request.files as Express.Multer.File[]
    const pictureBuffers = pictures.map((file) => file.buffer)

    // 2. Delega a execução da lógica de negócio para o serviço
    const result = await this.createAnimal.execute({
      // ...dados...
    })

    // 3. Formata e retorna a resposta HTTP baseada no resultado
    const statusCode = result.isFailure() ? 400 : 201
    return response.status(statusCode).json(result.value)
  }
}
```

### Princípio Aberto/Fechado (OCP)

Este princípio estabelece que o software deve ser aberto para extensão, mas fechado para modificação. A arquitetura do projeto adere a este princípio em seu nível macro, mas apresenta pontos de melhoria em implementações específicas.

**Aplicação em Nível Arquitetural:**

A estrutura modular, com um arquivo por caso de uso, permite que novas funcionalidades sejam adicionadas ao sistema sem a necessidade de alterar código existente e já testado. Por exemplo, para adicionar um novo recurso, um desenvolvedor criaria novos arquivos de `controller` e `service`, estendendo as capacidades do sistema de forma segura.

**Ponto de Análise e Melhoria:**

Em alguns pontos, o princípio poderia ser aplicado de forma mais rigorosa. Um exemplo é a função de listagem de animais com filtros, no `AnimalRepository`.

```typescript
// src/repositories/animal.ts
async findAllAvailableNotFromUser({ /* ...filtros... */ }) {
  return this.repository.animal.findMany({
    where: {
      // ...
      ...(gender ? { gender } : {}),
      ...(type ? { type } : {}),
      ...(name ? { name: { contains: name, mode: 'insensitive' } } : {}),
    },
    // ...
  })
}
```

Atualmente, para adicionar um novo critério de filtro (como `idade` ou `porte`), é necessário modificar o corpo do objeto `where` dentro deste método. Isso representa uma violação do "fechado para modificação".

Uma evolução futura poderia refatorar esta lógica utilizando padrões como **Strategy** ou **Specification**, onde cada filtro seria encapsulado em seu próprio objeto. Isso permitiria adicionar novos filtros sem alterar o método do repositório, aderindo de forma mais estrita ao OCP.

### Princípio da Inversão de Dependência (DIP)

Este princípio é aplicado em toda a aplicação através do padrão de **Injeção de Dependência (DI)**. Módulos de alto nível (como controllers) não dependem de implementações concretas de baixo nível (como serviços ou repositórios), mas sim de abstrações que são "injetadas" em seus construtores.

**Exemplo Prático: Injeção de Dependências em Cascata**

O `CreateAnimalController` depende de `CreateAnimalService`, que por sua vez depende de `AnimalRepository`. Em nenhum momento uma classe cria sua própria dependência.

```typescript
// Controller depende de um Serviço
// src/controllers/animal/create-animal.ts
class CreateAnimalController {
  constructor(private readonly createAnimal: CreateAnimalService) {}
}

// Serviço depende de um ou mais Repositórios
// src/services/animal/create-animal.ts
class CreateAnimalService {
  constructor(
    private readonly animalRepository: AnimalRepository,
    private readonly animalImageRepository: AnimalImageRepository,
  ) {}
}

// Repositório depende do client do Banco de Dados
// src/repositories/animal.ts
class AnimalRepository {
  constructor(private readonly repository: PrismaClient) {}
}
```

---

## 2. Padrões de Projeto (Design Patterns)

Além dos princípios SOLID, a aplicação utiliza diversos padrões de projeto para resolver problemas comuns de forma elegante e reutilizável.

### Padrão Singleton

O padrão Singleton é utilizado de forma pragmática para garantir que exista apenas uma instância de objetos reutilizáveis, como controllers, serviços e repositórios. Isso evita a criação desnecessária de objetos, economizando memória e garantindo um ponto de acesso único para aquele recurso.

**Exemplo Prático: Instância Única de um Repositório**

Uma única instância do `AnimalRepository` é criada (recebendo o `prisma` como dependência) e exportada para ser usada em toda a aplicação.

```typescript
// src/repositories/animal.ts
// A instância única do Prisma é injetada
export const animalRepositoryInstance = new AnimalRepository(prisma)
```

### Padrão Facade

O padrão Fachada é utilizado para fornecer uma interface simplificada e unificada para um subsistema mais complexo. No projeto, ele é aplicado de forma clara nas classes de Repositório, que servem como uma "fachada" para a complexidade do acesso ao banco de dados através do Prisma ORM.


**Exemplo Prático: Repositório como Fachada para o Prisma ORM**

A classe `AnimalRepository` atua como uma fachada que esconde os detalhes de implementação do Prisma. A camada de serviço não precisa saber como construir queries ou quais são os métodos específicos do Prisma; ela apenas chama os métodos simples e diretos expostos pelo repositório.

```typescript
// A camada de serviço (cliente) usa uma interface simples:
// src/services/animal/create-animal.ts
class CreateAnimalService {
  constructor(private readonly animalRepository: AnimalRepository) {}

  async execute(params: ...) {
    // Chama o método simples da fachada
    const animal = await this.animalRepository.create({ ... });
    // ...
  }
}


// O repositório (a fachada) esconde a complexidade interna:
// src/repositories/animal.ts
export class AnimalRepository {
  constructor(private readonly repository: PrismaClient) {}

  async create(params: CreateAnimalRepositoryDTO.Params) {
    // Aqui está a chamada complexa para o subsistema (Prisma),
    // que fica escondida do serviço.
    return this.repository.animal.create({ data: params });
  }
}
```

### Padrão Adapter

Este padrão é utilizado para converter a interface de um objeto em outra que o cliente espera, permitindo que objetos com interfaces incompatíveis trabalhem juntos. No projeto, ele é aplicado na camada de API do frontend para normalizar as complexas respostas de erro da biblioteca `axios` em um formato simples e consistente que o resto da aplicação possa manusear facilmente.

**Vantagem:** O resto da aplicação não precisa saber como tratar a estrutura específica de um `AxiosError`. Se a biblioteca de requisições HTTP (`axios`) for trocada por outra no futuro, apenas este "adaptador" de erro precisaria ser modificado, garantindo que o restante do código que consome a API não seja afetado.

**Exemplo Prático: `makeRequest` adaptando o `AxiosError`**

```typescript
// src/api/index.ts
export async function makeRequest({ /* ...parâmetros... */ }) {
  try {
    const response = await api.request({ /* ... */ });
    return response;
  } catch (err) {
    const error = err as AxiosError; // O objeto original com interface complexa

    // O bloco a seguir atua como um ADAPTADOR, convertendo o erro.
    if (error.response) {
      // A estrutura complexa "error.response" (com headers, config, etc.)
      // é adaptada para uma interface simples e consistente: { status, data }
      return { status: error.response.status, data: error.response.data };
    }

    // Adapta até mesmo erros de rede (que não possuem 'response') para a mesma interface
    return { status: 500, data: { message: error.message } };
  }
}
```