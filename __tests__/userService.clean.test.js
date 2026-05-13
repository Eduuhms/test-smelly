const { UserService } = require('../src/userService');

const defaultUserData = {
  nome: 'Fulano de Tal',
  email: 'fulano@teste.com',
  idade: 25,
};

describe('UserService - clean tests', () => {
  let userService;

  beforeEach(() => {
    userService = new UserService();
    userService._clearDB();
  });

  test('createUser returns user with id and active status', () => {
    // Arrange
    const { nome, email, idade } = defaultUserData;

    // Act
    const created = userService.createUser(nome, email, idade);

    // Assert
    expect(created.id).toBeDefined();
    expect(created.nome).toBe(nome);
    expect(created.email).toBe(email);
    expect(created.idade).toBe(idade);
    expect(created.status).toBe('ativo');
  });

  test('getUserById returns existing user', () => {
    // Arrange
    const created = userService.createUser(
      defaultUserData.nome,
      defaultUserData.email,
      defaultUserData.idade
    );

    // Act
    const found = userService.getUserById(created.id);

    // Assert
    expect(found).not.toBeNull();
    expect(found.id).toBe(created.id);
  });

  test('getUserById returns null for missing id', () => {
    // Arrange
    const missingId = 'missing-id';

    // Act
    const found = userService.getUserById(missingId);

    // Assert
    expect(found).toBeNull();
  });

  test('deactivateUser returns true and updates status for non-admin', () => {
    // Arrange
    const user = userService.createUser('Comum', 'comum@teste.com', 30);

    // Act
    const result = userService.deactivateUser(user.id);
    const updated = userService.getUserById(user.id);

    // Assert
    expect(result).toBe(true);
    expect(updated.status).toBe('inativo');
  });

  test('deactivateUser returns false for admin user', () => {
    // Arrange
    const admin = userService.createUser('Admin', 'admin@teste.com', 40, true);

    // Act
    const result = userService.deactivateUser(admin.id);
    const updated = userService.getUserById(admin.id);

    // Assert
    expect(result).toBe(false);
    expect(updated.status).toBe('ativo');
  });

  test('deactivateUser returns false for missing user', () => {
    // Arrange
    const missingId = 'missing-id';

    // Act
    const result = userService.deactivateUser(missingId);

    // Assert
    expect(result).toBe(false);
  });

  test('generateUserReport shows header and empty message when no users', () => {
    // Arrange
    // Database is already empty in beforeEach.

    // Act
    const report = userService.generateUserReport();

    // Assert
    expect(report).toMatch(/---\s*Relat/);
    expect(report).toMatch(/Nenhum usu.rio cadastrado/);
  });

  test('generateUserReport includes user names and status', () => {
    // Arrange
    userService.createUser('Alice', 'alice@email.com', 28);
    userService.createUser('Bob', 'bob@email.com', 32);

    // Act
    const report = userService.generateUserReport();

    // Assert
    expect(report).toMatch(/Nome: Alice/);
    expect(report).toMatch(/Nome: Bob/);
    expect(report).toMatch(/Status: ativo/);
  });

  test('createUser throws for underage users', () => {
    // Arrange
    const createUnderage = () =>
      userService.createUser('Menor', 'menor@email.com', 17);

    // Act
    const act = createUnderage;

    // Assert
    expect(act).toThrow(/maior de idade/);
  });
});
