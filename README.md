# Vamove

Aplicativo de conversas privadas para contas autorizadas, com mensagens em tempo real, emojis e imagens normais ou de visualização única. A exclusão de uma conversa remove as mensagens e imagens **para ambos os participantes**. Não há chamadas nem cadastro público.

## Preparação no Firebase

1. Crie um projeto Firebase, ative Authentication com provedor **E-mail/senha**, Firestore e Cloud Storage. A implantação de Cloud Functions exige o plano Blaze. Instale o [Firebase CLI](https://firebase.google.com/docs/cli), execute `firebase login` e selecione o projeto com `firebase use --add`.
2. Crie um aplicativo Web no projeto. Copie `.env.example` para `.env` e preencha as variáveis com a configuração desse aplicativo, incluindo o nome exato do bucket do Storage. Essas informações identificam o projeto e não são uma credencial administrativa.
3. Execute `npm ci`, `npm run build` e `firebase deploy`. Publique **as regras e funções junto com o Hosting**; sem elas o aplicativo não é seguro nem funcional. O servidor usa Node.js 22 e a região padrão `us-central1`. Use o bucket padrão do projeto para as funções.
4. No console Firebase Authentication, crie cada conta com e-mail e senha. Não disponibilize cadastro público. Para autorizar uma conta no aplicativo, configure credenciais administrativas locais (por exemplo, `gcloud auth application-default login` e `gcloud config set project ID_DO_PROJETO`) e execute:

   ```sh
   node tools/enable-user.js UID_DO_AUTH "Nome de usuário"
   ```

   O UID é mostrado no console Authentication. Repita apenas para pessoas autorizadas. Para revogar o acesso, desative a conta no Authentication e altere `users/UID_DO_AUTH` no Firestore para `enabled: false`; revogue também as sessões no Authentication quando necessário. O nome de usuário é exibido aos demais usuários autorizados; o login usa e-mail e senha.

Para desenvolvimento, use `npm run dev`. Execute `npm test` e `npm run build` para verificar o projeto.

## Privacidade e limitações

- As regras permitem leitura apenas por contas autorizadas e participantes. Escritas e acesso às imagens são feitos por Cloud Functions com verificação de acesso; o Storage bloqueia acesso direto dos clientes. A imagem de visualização única é liberada apenas uma vez ao destinatário e removida do bucket após a abertura. Não é possível impedir capturas de tela, fotos da tela ou cópias feitas pelo destinatário.
- O Firebase não oferece garantia automática de que nenhum registro recuperável permaneça. Para aproximar a exclusão permanente desejada, **desative soft delete e versionamento no bucket**, não configure retenção ou bloqueio de objetos, e desative backups agendados e recuperação point-in-time do Firestore. Verifique também as políticas de retenção e logs do Google Cloud antes de usar. Alterar políticas não elimina automaticamente versões ou backups anteriores.
- Se a exclusão falhar, a conversa fica bloqueada e qualquer participante pode tentar novamente. Uma interrupção durante o envio ou abertura de imagem pode deixar um arquivo residual no bucket; monitore e remova resíduos operacionais. Cache local do navegador, dispositivos de destinatários, logs de infraestrutura e eventuais backups fora do aplicativo não são apagados por ele.
- Este aplicativo **não fornece criptografia de ponta a ponta**. Os dados são protegidos pelas regras e pela infraestrutura Firebase, mas administradores do projeto e serviços autorizados podem acessá-los. Não use para informações que exijam proteção contra o próprio operador.