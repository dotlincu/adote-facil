describe('Login', () => {
  it('Deve realizar login com credenciais válidas', () => {
    cy.visit('http://localhost:3000/login')

    // preenche o login
    cy.get('input[name="email"]').type('usuario@mail.com')
    cy.get('input[name="password"]').type('12345678')

    // clica no botão
    cy.get('button[type="submit"]').click()

    // valida url e texto na tela
    cy.url().should('include', '/area_logada')
    
    // Checa o título da página
    cy.get('h1').should('contain.text', 'Animais disponíveis para adoção')
  })
})
