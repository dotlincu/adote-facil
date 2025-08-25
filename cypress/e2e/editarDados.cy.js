Cypress.on('uncaught:exception', (err, runnable) => {
  return false // impede que o Cypress falhe o teste por causa de erros da aplicação
})

describe('Editar dados pessoais', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[type="email"]').type('lincoln@mail.com');
    cy.get('input[type="password"]').type('12345678');
    cy.contains('button', 'Login').click();

    // Navega para a página de edição de dados
    cy.contains('Editar dados pessoais').click({ force: true });
  });

  it('Deve alterar apenas o nome do usuário com sucesso', () => {
    const novoNome = 'LincolnAtualizado';
    const emailOriginal = 'lincoln@mail.com';

    // Limpa o campo de nome e digita o novo nome
    cy.get('input[name="name"]').clear().type(novoNome);

    cy.contains('button', 'Salvar alterações').click();

    cy.contains('Editar dados pessoais').click({ force: true }); // Reabre a página de edição para verificar

    cy.get('input[name="name"]').should('have.value', novoNome);

    cy.get('input[name="email"]').should('have.value', emailOriginal);
  });
});