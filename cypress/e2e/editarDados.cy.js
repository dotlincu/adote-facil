Cypress.on('uncaught:exception', (err, runnable) => {
  return false // impede que o Cypress falhe o teste por causa de erros da aplicação
})

describe('Editar dados pessoais', () => {
  beforeEach(() => {
    cy.visit('http://localhost:3000/login');
    cy.get('input[type="email"]').type('usuario@mail.com');
    cy.get('input[type="password"]').type('12345678');
    cy.contains('button', 'Login').click();

    // navega para a página de edição de dados
    cy.contains('Editar dados pessoais').click({ force: true });
  });

  it('Deve alterar apenas o nome do usuário com sucesso', () => {
    const novoNome = 'UsuarioAtualizado';
    const emailOriginal = 'usuario@mail.com';

    // limpa o campo de nome e digita o novo nome
    cy.get('input[name="name"]').clear().type(novoNome);

    cy.contains('button', 'Salvar alterações').click();

    // reabre a página de edição para verificar
    cy.contains('Editar dados pessoais').click({ force: true }); 

    cy.get('input[name="name"]').should('have.value', novoNome);

    cy.get('input[name="email"]').should('have.value', emailOriginal);
  });

  // cenário alternativo
  it('Deve exibir uma mensagem de erro ao tentar salvar o nome em branco', () => {
    // limpa o campo de nome, deixando-o vazio
    cy.get('input[name="name"]').clear();

    // tenta salvar as alterações
    cy.contains('button', 'Salvar alterações').click();

    // a verificação principal: a mensagem de erro deve aparecer
    cy.contains('O nome é obrigatório').should('be.visible');

    // verificação secundária: a URL não deve mudar
    cy.url().should('include', '/area_logada/editar_dados'); 
  });
});