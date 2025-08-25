Cypress.on('uncaught:exception', (err, runnable) => {
  return false // impede que o Cypress falhe o teste por causa de erros da aplicação
})

describe('Cadastro de animal para adoção', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login')
    cy.get('input[type="email"]').type('lincoln@mail.com')
    cy.get('input[type="password"]').type('12345678')
    cy.contains('button', 'Login').click()
  })

 it('Deve cadastrar um animal para adoção', () => {
    cy.contains('Disponibilizar animal para adoção').click({ force: true }) // forçar clique se necessário

    cy.get('input[name="name"]').type('Linux') 

    cy.get('button[role="combobox"]').filter(':contains("Selecione um tipo")').click();

    cy.get('div[role="option"]').contains('Cachorro').click();

    cy.get('button[role="combobox"]').filter(':contains("Selecione um gênero")').click();
        
    cy.get('div[role="option"]').contains('Macho').click();

    cy.get('input[name="race"]').type('Vira-lata')

    cy.get('textarea[name="description"]').type('Cachorro dócil e brincalhão.')

    cy.get('input[type="file"]').selectFile('cypress/fixtures/dog1.jpg', { force: true });

    cy.contains('button', 'Cadastrar').click();

    cy.contains('Meus animais disponíveis para adoção').click({ force: true })
    cy.contains('Linux').should('be.visible')
    })
})