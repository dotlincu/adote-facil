# Análise de práticas DevOps - Adote Fácil

## 1. Pipeline CI/CD e Testes Automatizados

O projeto conta com um arquivo chamado ```experimento-ci-cd.yml```, responsável por configurar o pipeline CI/CD utilizando o GitHub Actions. O primeiro job do pipeline executa testes unitários por meio do Jest, um framework amplamente utilizado para testes em aplicações JavaScript. Essa etapa garante que as funcionalidades do sistema sejam validadas automaticamente a cada nova alteração no código.

## 2. Uso de Conteiners

A utilização de containers está presente nos *jobs* **build** e **up-conteiners**. No *job* **build**, são configuradas duas ferramentas essenciais da plataforma Docker: Buildx e QEMU. O Buildx permite a execução de builds mais avançados, enquanto o QEMU habilita a criação de imagens multiplataforma por meio de emulação. Após essas configurações, o pipeline executa a construção das imagens Docker especificadas no arquivo docker-compose.yml.

No *job* **up-conteiners**, são realizados três comandos sequenciais:

```docker compose up -d```: inicializa os containers em segundo plano. O uso da flag -d é fundamental para evitar que o pipeline fique bloqueado aguardando a finalização manual dos processos.

```sleep 10```: pausa de 10 segundos para garantir que todos os serviços subam corretamente antes de prosseguir.

```docker compose down```: finaliza e remove os containers, garantindo que o ambiente seja limpo ao final da execução.

## 3. Possíveis melhorias

### 1. Job release no pipeline CI/CD

Foi incluído um *job* chamado release no pipeline, que, após a geração bem-sucedida do artefato no estágio anterior, cria automaticamente uma nova *release* no GitHub. Esse job calcula a próxima versão, incrementando o número do *patch* (por exemplo, de v1.0.0 para v1.0.1), anexa o arquivo .zip gerado e publica a *release* de forma automática.

### 2. Políticas de reinício no docker-compose

A política *restart: unless-stopped* foi adicionada a todos os serviços da aplicação (banco de dados, backend e frontend). Esta configuração aumenta a resiliência do ambiente, garantindo que, em caso de falha inesperada ou reinicialização do servidor, os contêineres sejam automaticamente reiniciados. A política só não se aplica se os contêineres forem parados manualmente pelo usuário, assegurando a alta disponibilidade dos serviços.