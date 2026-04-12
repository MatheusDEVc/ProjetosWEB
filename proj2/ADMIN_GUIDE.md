## 👨‍💼 Painel Administrativo - Guia de Uso

### O que é?
O Painel Administrativo é uma página especial onde você pode gerenciar todos os pedidos dos clientes e alterar seus status de forma manual e intuitiva.

### Como Acessar?

#### Opção 1: URL Direta
```
Abra no navegador: admin.html
Ou: http://localhost/proj2/admin.html (se usando servidor local)
```

#### Opção 2: Adicione um Link no Menu
(Você pode adicionar um link "Administrador" no header se desejar)

### Funcionalidades Principais

#### 1. **Dashboard de Estatísticas**
No topo da página, você vê:
- 📊 Total de Pedidos
- 💰 Receita Total
- ✅ Pedidos Entregues
- ⏳ Pedidos Pendentes

Essas estatísticas atualizam automaticamente quando você altera os status.

#### 2. **Filtros e Busca**
```
🔍 Buscar por Pedido/Email
   - Digite o número do pedido (GU123ABC45)
   - Ou o email do cliente (email@exemplo.com)

Filtrar por Status
   - Todos os Status (padrão)
   - ✅ Confirmado
   - ⚙️ Processando
   - 📦 Preparando
   - 🚚 Enviado
   - 🎉 Entregue
   - ❌ Cancelado

Ordenar por
   - Mais Recentes (padrão)
   - Mais Antigos
   - Maior Valor
   - Menor Valor

Clique em "Filtrar" para aplicar
```

#### 3. **Cartão de Pedido**
Cada pedido exibe:

**📦 Informações do Pedido**
- Número do pedido único (GU...)
- Data de criação
- Status atual (badge colorido)

**👤 Dados do Cliente**
- Nome completo
- Email
- Telefone
- CPF

**📍 Endereço de Entrega**
- Rua/Avenida
- Número
- Cidade/Estado
- CEP

**💳 Método de Pagamento**
- Cartão de Crédito, Débito, PIX ou Boleto
- Valor total do pedido

**📋 Produtos**
- Lista de todos os itens comprados
- Quantidade de cada produto
- Preço individual
- Total do pedido

#### 4. **Alterar Status (Principal Funcionalidade)**
Para mudar o status de um pedido:

1. Localize o pedido usando busca ou filtros
2. Na seção "🔄 Alterar Status", veja os botões de status
3. Clique no botão do status desejado:
   - ✅ **Confirmado** - Pedido recém confirmado
   - ⚙️ **Processando** - Sendo processado
   - 📦 **Preparando** - Sendo preparado para envio
   - 🚚 **Enviado** - Saiu para entrega
   - 🎉 **Entregue** - Chegou ao cliente
   - ❌ **Cancelado** - Pedido cancelado

4. O status é atualizado **imediatamente**
5. Uma notificação de sucesso aparece no canto superior direito

#### 5. **Histórico de Status**
Cada pedido mostra:
- **📜 Histórico de Status**
- Lista cronológica (mais recentes primeiro) de todas as alterações
- Data e hora exata de cada mudança
- Mensagem descritiva para cada status

### Exemplo de Uso Prático

**Cenário:** Um cliente fez um pedido e você quer acompanhá-lo desde a confirmação até a entrega.

```
1. Acesse o Painel Administrativo (admin.html)
2. Busque pelo email do cliente ou número do pedido
3. Ao encontrar, verá o cartão com status atual
4. Clique em "✅ Confirmado" para confirmar
5. Quando começar o processamento, clique "⚙️ Processando"
6. Quando preparar o envio, clique "📦 Preparando"
7. Quando sair para entrega, clique "🚚 Enviado"
8. Quando chegar, clique "🎉 Entregue"
9. Veja o histórico atualizado em tempo real
```

### Como o Cliente Vê as Mudanças?

Quando você altera um status no Painel Administrativo:

1. ✅ O status é **salvo no localStorage**
2. ✅ O cliente vê a mudança ao entrar em "Meus Pedidos"
3. ✅ A página de rastreamento (Rastreamento) mostra a timeline atualizada
4. ✅ O histórico de status se atualiza com a nova entrada

**Importante:** O cliente verá as mudanças quando:
- Recarregar a página (F5)
- Voltar para "Meus Pedidos"
- Acessar a página de rastreamento

### Status Explicados

| Status | Ícone | Cor | Significado |
|--------|-------|-----|------------|
| **Confirmado** | ✅ | Verde | Pedido foi recebido e confirmado |
| **Processando** | ⚙️ | Azul | Sistema está processando o pedido |
| **Preparando** | 📦 | Laranja | Equipe está preparando para envio |
| **Enviado** | 🚚 | Cyan | A transportadora pegou o pedido |
| **Entregue** | 🎉 | Verde | Cliente recebeu o pedido |
| **Cancelado** | ❌ | Vermelho | Pedido foi cancelado |

### Dicas e Boas Práticas

✅ **Sempre confirme o pedido** (✅ Confirmado) assim que receber
✅ **Mantenha os status atualizados** para melhor experiência do cliente
✅ **Use a busca** para encontrar rapidamente um pedido específico
✅ **Verifique o histórico** antes de fazer alterações
❌ **Não altere diretamente** se ainda não processou

### Sincronização Automática

- ⏱️ A página recarrega dados **a cada 10 segundos** automaticamente
- 📊 As estatísticas se atualizam em tempo real
- 🔄 Múltiplas abas do navegador sincronizam automaticamente

### Limitações Atuais

- ⚠️ Tudo é armazenado no **localStorage** do navegador
- ⚠️ Se limpar cookies/dados, os pedidos são perdidos
- ⚠️ Funciona apenas neste navegador/dispositivo
- ⚠️ Não há autenticação (qualquer um com acesso a admin.html pode editar)

### Próximas Melhorias Possíveis

💡 Adicionar autenticação (usuário/senha)
💡 Integrar com backend/banco de dados
💡 Enviar notificações por email ao cliente
💡 Permitir cancelamento de pedidos
💡 Gerar relatórios de vendas
💡 Sincronização em tempo real com WebSocket
💡 Exportar pedidos para Excel/PDF
💡 Busca avançada com múltiplos filtros

### Suporte

Para problemas ou dúvidas:
- Abra o console do navegador (F12) para ver logs
- Verifique se os dados estão no localStorage
- Recarregue a página (Ctrl+F5) se algo parecer desatualizado
