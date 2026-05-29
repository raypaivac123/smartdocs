// Define o pacote onde essa classe de teste está localizada.
// Tem que ser o mesmo pacote da área de documentos do projeto.
package com.smartdocs.document;

// Importa o serviço de IA usado pelo DocumentService.
// Aqui ele será simulado com Mockito, não será chamado de verdade.
import com.smartdocs.ai.ClaudeService;

// Importa o serviço de auditoria.
// Ele registra ações como upload, processamento, erro etc.
// No teste, também será simulado.
import com.smartdocs.audit.AuditService;

// Importa a entidade User.
// Vamos usar para simular o usuário autenticado no teste.
import com.smartdocs.auth.User;

// Importa o repositório de usuários.
// O DocumentService usa isso para buscar o usuário logado.
import com.smartdocs.auth.UserRepository;

// Importa o producer do RabbitMQ.
// Ele é responsável por enviar mensagem para a fila.
// No teste, vamos verificar se ele foi chamado.
import com.smartdocs.messaging.DocumentProcessingProducer;

// Importa o repositório de tarefas.
// O DocumentService usa isso quando a IA gera tarefas a partir do documento.
import com.smartdocs.task.TaskRepository;

// Importa classes do PDFBox.
// Vamos usar para criar um PDF real temporário no teste de processamento.
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;

// Importa a anotação usada para preparar algo antes de cada teste.
import org.junit.jupiter.api.BeforeEach;

// Importa a anotação que marca um método como teste.
import org.junit.jupiter.api.Test;

// Importa a extensão do JUnit.
// Ela permite integrar o JUnit com bibliotecas externas.
import org.junit.jupiter.api.extension.ExtendWith;

// Importa a anotação que cria a classe real que será testada,
// injetando nela os mocks.
import org.mockito.InjectMocks;

// Importa a anotação que cria objetos falsos, chamados de mocks.
import org.mockito.Mock;

// Importa a extensão do Mockito para funcionar com JUnit 5.
import org.mockito.junit.jupiter.MockitoExtension;

// Importa uma classe do Spring usada para criar um arquivo falso no teste.
// Assim não precisamos pegar um PDF real do computador para o teste de upload.
import org.springframework.mock.web.MockMultipartFile;

// Importa a classe usada para simular autenticação no Spring Security.
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

// Importa o contexto de segurança do Spring.
// O DocumentService usa isso para descobrir quem é o usuário logado.
import org.springframework.security.core.context.SecurityContextHolder;

// Importa uma ferramenta de teste do Spring.
// Usamos para preencher campos privados, como storagePath e id.
import org.springframework.test.util.ReflectionTestUtils;

// Importa classes para criar arquivos e pastas temporárias nos testes.
import java.nio.file.Files;
import java.nio.file.Path;

// Importa List e Map.
// Vamos usar para montar a resposta falsa da IA.
import java.util.List;
import java.util.Map;

// Importa Optional, usado quando simulamos retorno do UserRepository e DocumentRepository.
import java.util.Optional;

// Importa UUID, usado para criar IDs falsos no teste.
import java.util.UUID;

// Importa o assertThat do AssertJ.
// Vamos usar para verificar se os resultados estão corretos.
import static org.assertj.core.api.Assertions.assertThat;

// Importa o assertThatThrownBy do AssertJ.
// Vamos usar para testar se uma exceção foi lançada.
import static org.assertj.core.api.Assertions.assertThatThrownBy;

// Importa any() do Mockito.
// Usamos quando queremos dizer: "qualquer objeto desse tipo".
import static org.mockito.ArgumentMatchers.any;

// Importa métodos do Mockito como when(), verify(), times(), never(), eq(), contains() etc.
import static org.mockito.Mockito.*;

// Essa anotação ativa o Mockito dentro desta classe de teste.
// Sem ela, os @Mock e @InjectMocks não funcionariam corretamente.
@ExtendWith(MockitoExtension.class)

// Classe de teste do DocumentService.
// Por padrão, classes de teste podem ficar sem public.
class DocumentServiceTest {

    // Cria um DocumentRepository falso.
    // Não vamos acessar banco de dados real neste teste.
    @Mock
    private DocumentRepository documentRepo;

    // Cria um TaskRepository falso.
    // Não vamos salvar tarefas reais no banco durante o teste.
    @Mock
    private TaskRepository taskRepo;

    // Cria um UserRepository falso.
    // Vamos simular o usuário logado sem consultar banco real.
    @Mock
    private UserRepository userRepo;

    // Cria um ClaudeService falso.
    // Não vamos chamar a IA real durante o teste unitário.
    @Mock
    private ClaudeService claudeService;

    // Cria um AuditService falso.
    // Não vamos registrar auditoria real no banco.
    @Mock
    private AuditService auditService;

    // Cria um Producer falso do RabbitMQ.
    // Não vamos enviar mensagem real para o RabbitMQ.
    // Vamos apenas verificar se o método de envio foi chamado.
    @Mock
    private DocumentProcessingProducer documentProcessingProducer;

    // Cria o DocumentService real que será testado.
    // O Mockito coloca dentro dele todos os mocks acima.
    //
    // Ou seja:
    // DocumentService real
    // DocumentRepository falso
    // TaskRepository falso
    // UserRepository falso
    // ClaudeService falso
    // AuditService falso
    // RabbitMQ Producer falso
    @InjectMocks
    private DocumentService documentService;

    // Esse método roda antes de cada teste.
    // Usamos para preparar dados repetidos, quando necessário.
    @BeforeEach
    void setUp() {
        // Simulamos que existe um usuário logado no sistema.
        //
        // No sistema real, o Spring Security faz isso depois do login.
        // No teste, precisamos fazer manualmente.
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        "dev@smartdocs.de",
                        null
                );

        // Coloca a autenticação falsa dentro do contexto de segurança.
        // Assim, quando o DocumentService procurar o usuário logado,
        // ele vai encontrar o e-mail "dev@smartdocs.de".
        SecurityContextHolder.getContext().setAuthentication(authentication);

        /*
         * Como este é um teste unitário, o Spring não lê o application.properties.
         *
         * No projeto real, o storagePath vem daqui:
         * smartdocs.storage.path=./uploads
         *
         * Mas no teste não subimos o Spring inteiro.
         * Então colocamos manualmente uma pasta de teste.
         */
        ReflectionTestUtils.setField(
                documentService,
                "storagePath",
                "target/test-uploads"
        );
    }

    // -------------------------------------------------------------------------
    // TESTE 1
    // Cenário positivo:
    // Upload de PDF válido deve salvar documento, marcar como PENDING,
    // registrar auditoria e enviar mensagem para RabbitMQ.
    // -------------------------------------------------------------------------

    @Test
    void upload_deveSalvarDocumentoComoPendingEEnviarParaRabbitMQ() throws Exception {
        // GIVEN significa: preparando o cenário do teste.

        // Criamos um usuário falso para representar quem está logado.
        User user = User.builder()
                .name("Ana Becker")
                .email("dev@smartdocs.de")
                .build();

        // Criamos um arquivo PDF falso.
        //
        // Esse arquivo não vem do computador.
        // Ele é criado em memória só para o teste.
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "contrato.pdf",
                "application/pdf",
                "conteudo fake do pdf".getBytes()
        );

        // Quando o DocumentService procurar o usuário pelo e-mail,
        // o UserRepository falso vai devolver o usuário fake que criamos acima.
        when(userRepo.findByEmail("dev@smartdocs.de"))
                .thenReturn(Optional.of(user));

        /*
         * Quando o DocumentService salvar um Document,
         * simulamos que o banco gerou um ID para ele.
         *
         * No sistema real, quem gera o ID é o banco/JPA.
         * No teste unitário, não tem banco real.
         * Então fazemos isso manualmente.
         */
        when(documentRepo.save(any(Document.class)))
                .thenAnswer(invocation -> {
                    // Pega o Document que o service tentou salvar.
                    Document document = invocation.getArgument(0);

                    // Coloca um ID falso no documento.
                    ReflectionTestUtils.setField(
                            document,
                            "id",
                            UUID.randomUUID()
                    );

                    // Devolve o mesmo documento, como se ele tivesse sido salvo.
                    return document;
                });

        // WHEN significa: executando a ação que queremos testar.
        //
        // Aqui o método real do DocumentService é chamado.
        Document result = documentService.upload(file);

        // THEN significa: verificando se o resultado está correto.

        // Verifica se o Document retornado não é nulo.
        assertThat(result).isNotNull();

        // Verifica se o nome do arquivo foi salvo corretamente.
        assertThat(result.getFilename()).isEqualTo("contrato.pdf");

        // Verifica se o status inicial ficou PENDING.
        //
        // Isso faz sentido porque o documento ainda será processado depois,
        // de forma assíncrona, pelo RabbitMQ.
        assertThat(result.getStatus()).isEqualTo(Document.DocumentStatus.PENDING);

        // Verifica se o usuário que fez upload foi associado ao documento.
        assertThat(result.getUploadedBy()).isEqualTo(user);

        // Verifica se o DocumentRepository salvou um documento exatamente uma vez.
        verify(documentRepo, times(1)).save(any(Document.class));

        // Verifica se o AuditService registrou o upload.
        verify(auditService, times(1))
                .log(
                        eq("UPLOAD"),
                        eq("Document"),
                        any(),
                        contains("contrato.pdf")
                );

        // Verifica se o RabbitMQ Producer foi chamado uma vez.
        //
        // Isso confirma que o documento foi enviado para processamento assíncrono.
        verify(documentProcessingProducer, times(1))
                .sendDocumentForProcessing(any(UUID.class));
    }

    // -------------------------------------------------------------------------
    // TESTE 2
    // Cenário negativo:
    // Upload de arquivo vazio deve ser rejeitado.
    // -------------------------------------------------------------------------

    @Test
    void upload_deveRejeitarArquivoVazio() {
        // GIVEN significa: preparando o cenário do teste.

        // Criamos um arquivo falso vazio.
        //
        // O último parâmetro é new byte[0].
        // Isso significa: arquivo sem nenhum conteúdo.
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "vazio.pdf",
                "application/pdf",
                new byte[0]
        );

        // WHEN + THEN:
        //
        // Aqui estamos dizendo:
        // quando eu chamar documentService.upload(file),
        // eu espero que o sistema lance uma exceção.
        assertThatThrownBy(() -> documentService.upload(file))

                // Verifica se o erro lançado é do tipo IllegalArgumentException.
                .isInstanceOf(IllegalArgumentException.class)

                // Verifica se a mensagem do erro é exatamente esta.
                .hasMessage("Datei ist leer.");

        // Como o arquivo é inválido, o sistema NÃO deve salvar nada no banco.
        verify(documentRepo, never()).save(any(Document.class));

        // Como o arquivo é inválido, o sistema NÃO deve enviar nada para RabbitMQ.
        verify(documentProcessingProducer, never())
                .sendDocumentForProcessing(any(UUID.class));

        // Como o arquivo é inválido, o sistema NÃO deve registrar auditoria de upload.
        verify(auditService, never())
                .log(any(), any(), any(), any());
    }

    // -------------------------------------------------------------------------
    // TESTE 3
    // Cenário negativo:
    // Upload de arquivo que não é PDF deve ser rejeitado.
    // -------------------------------------------------------------------------

    @Test
    void upload_deveRejeitarArquivoQueNaoEhPdf() {
        // GIVEN significa: preparando o cenário do teste.

        // Criamos um arquivo falso com extensão .png.
        //
        // Mesmo que ele tenha conteúdo, ele não deve ser aceito,
        // porque a regra do sistema permite apenas arquivos terminados em .pdf.
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "imagem.png",
                "image/png",
                "conteudo fake da imagem".getBytes()
        );

        // WHEN + THEN:
        //
        // Aqui esperamos que o upload lance uma IllegalArgumentException,
        // porque o arquivo não termina com .pdf.
        assertThatThrownBy(() -> documentService.upload(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Nur PDF-Dateien sind erlaubt.");

        // Como o arquivo é inválido, o sistema NÃO deve salvar nada no banco.
        verify(documentRepo, never()).save(any(Document.class));

        // Como o arquivo é inválido, o sistema NÃO deve enviar nada para RabbitMQ.
        verify(documentProcessingProducer, never())
                .sendDocumentForProcessing(any(UUID.class));

        // Como o arquivo é inválido, o sistema NÃO deve registrar auditoria de upload.
        verify(auditService, never())
                .log(any(), any(), any(), any());
    }

    // -------------------------------------------------------------------------
    // TESTE 4
    // Cenário negativo:
    // Upload de arquivo sem nome deve ser rejeitado.
    // -------------------------------------------------------------------------

    @Test
    void upload_deveRejeitarArquivoSemNome() {
        // GIVEN significa: preparando o cenário do teste.

        // Criamos um arquivo falso sem nome.
        //
        // O segundo parâmetro do MockMultipartFile é o nome original do arquivo.
        // Aqui colocamos null para simular um arquivo sem nome.
        MockMultipartFile file = new MockMultipartFile(
                "file",
                null,
                "application/pdf",
                "conteudo fake do pdf".getBytes()
        );

        // WHEN + THEN:
        //
        // Aqui esperamos que o upload lance uma IllegalArgumentException,
        // porque o arquivo não tem nome original.
        assertThatThrownBy(() -> documentService.upload(file))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Nur PDF-Dateien sind erlaubt.");

        // Como o arquivo é inválido, o sistema NÃO deve salvar nada no banco.
        verify(documentRepo, never()).save(any(Document.class));

        // Como o arquivo é inválido, o sistema NÃO deve enviar nada para RabbitMQ.
        verify(documentProcessingProducer, never())
                .sendDocumentForProcessing(any(UUID.class));

        // Como o arquivo é inválido, o sistema NÃO deve registrar auditoria de upload.
        verify(auditService, never())
                .log(any(), any(), any(), any());
    }

    // -------------------------------------------------------------------------
    // TESTE 5
    // Cenário positivo:
    // Processamento de documento deve marcar como PROCESSED
    // quando a IA retorna análise com sucesso.
    // -------------------------------------------------------------------------

    @Test
    void processDocument_deveMarcarDocumentoComoProcessedQuandoIaRetornaAnalise() throws Exception {
        // GIVEN significa: preparando o cenário do teste.

        // Criamos um ID falso para o documento.
        UUID documentId = UUID.randomUUID();

        // Criamos uma pasta de teste para salvar um PDF temporário.
        Path testDir = Path.of("target/test-files");

        // Garante que a pasta existe.
        Files.createDirectories(testDir);

        // Define o caminho do PDF falso.
        Path pdfPath = testDir.resolve("contrato-teste.pdf");

        /*
         * Criamos um PDF real, mas simples, com uma página em branco.
         *
         * Por que fazemos isso?
         * Porque o método processDocument chama extractText(filePath),
         * e esse método usa PDFBox para abrir um PDF de verdade.
         *
         * Então aqui não basta usar MockMultipartFile.
         * Precisamos de um arquivo PDF real no disco.
         */
        try (PDDocument pdf = new PDDocument()) {
            pdf.addPage(new PDPage());
            pdf.save(pdfPath.toFile());
        }

        // Criamos um usuário falso para representar quem fez upload do documento.
        User user = User.builder()
                .name("Ana Becker")
                .email("dev@smartdocs.de")
                .build();

        /*
         * Criamos um documento falso como se ele já estivesse salvo no banco.
         *
         * Repare que o status começa como PENDING,
         * porque ele ainda não foi processado pela IA.
         */
        Document document = Document.builder()
                .filename("contrato-teste.pdf")
                .originalFilename("contrato-teste.pdf")
                .filePath(pdfPath.toString())
                .status(Document.DocumentStatus.PENDING)
                .uploadedBy(user)
                .build();

        /*
         * Como no teste não existe banco real,
         * colocamos manualmente um ID no documento.
         */
        ReflectionTestUtils.setField(
                document,
                "id",
                documentId
        );

        /*
         * Criamos uma resposta falsa da IA.
         *
         * No sistema real, isso viria da API Claude.
         * No teste, não queremos chamar a internet nem gastar API.
         * Então simulamos a resposta.
         */
        ClaudeService.DocumentAnalysis analysis =
                new ClaudeService.DocumentAnalysis(
                        "VERTRAG",
                        Map.of(
                                "Kunde", "ACME GmbH",
                                "Dokumenttyp", "Vertrag"
                        ),
                        "Dies ist eine kurze Zusammenfassung des Vertrags.",
                        List.of("Vertrag prüfen")
                );

        /*
         * Quando o DocumentService procurar o documento pelo ID,
         * o repository falso vai devolver o documento fake.
         */
        when(documentRepo.findById(documentId))
                .thenReturn(Optional.of(document));

        /*
         * Quando o DocumentService chamar a IA,
         * o ClaudeService falso vai devolver a análise fake criada acima.
         */
        when(claudeService.analyzeDocument(any(), eq("contrato-teste.pdf")))
                .thenReturn(analysis);

        // WHEN significa: executando a ação que queremos testar.
        documentService.processDocument(documentId);

        // THEN significa: verificando se o resultado ficou correto.

        // Verifica se o status mudou de PENDING para PROCESSED.
        assertThat(document.getStatus())
                .isEqualTo(Document.DocumentStatus.PROCESSED);

        // Verifica se a classificação foi preenchida com VERTRAG.
        assertThat(document.getClassification())
                .isEqualTo(Document.Classification.VERTRAG);

        // Verifica se o resumo da IA foi salvo no documento.
        assertThat(document.getSummary())
                .isEqualTo("Dies ist eine kurze Zusammenfassung des Vertrags.");

        // Verifica se os campos extraídos foram salvos.
        assertThat(document.getExtractedFields())
                .containsEntry("Kunde", "ACME GmbH")
                .containsEntry("Dokumenttyp", "Vertrag");

        // Verifica se a data de processamento foi preenchida.
        assertThat(document.getProcessedAt())
                .isNotNull();

        // Verifica se o documento ficou com uma página.
        assertThat(document.getPageCount())
                .isEqualTo(1);

        // Verifica se o documento foi salvo depois do processamento.
        verify(documentRepo, times(1))
                .save(document);

        // Verifica se a IA foi chamada uma vez.
        verify(claudeService, times(1))
                .analyzeDocument(any(), eq("contrato-teste.pdf"));

        // Verifica se uma tarefa foi criada a partir da resposta da IA.
        verify(taskRepo, times(1))
                .save(any());

        // Verifica se a auditoria de processamento foi registrada.
        verify(auditService, times(1))
                .log(
                        eq("PROCESSED"),
                        eq("Document"),
                        eq(documentId.toString()),
                        contains("VERTRAG")
                );
    }
    // -------------------------------------------------------------------------
// TESTE 6
// Cenário negativo:
// Processamento de documento deve marcar como ERROR quando a IA falha.
// -------------------------------------------------------------------------

    @Test
    void processDocument_deveMarcarDocumentoComoErrorQuandoIaFalha() throws Exception {
        // GIVEN significa: preparando o cenário do teste.

        // Criamos um ID falso para o documento.
        UUID documentId = UUID.randomUUID();

        // Criamos uma pasta de teste para salvar um PDF temporário.
        Path testDir = Path.of("target/test-files");

        // Garante que a pasta existe.
        Files.createDirectories(testDir);

        // Define o caminho do PDF falso.
        Path pdfPath = testDir.resolve("contrato-com-erro.pdf");

        /*
         * Criamos um PDF real simples.
         *
         * O processDocument precisa abrir um PDF real com PDFBox.
         * Por isso criamos esse arquivo temporário no teste.
         */
        try (PDDocument pdf = new PDDocument()) {
            pdf.addPage(new PDPage());
            pdf.save(pdfPath.toFile());
        }

        // Criamos um usuário falso.
        User user = User.builder()
                .name("Ana Becker")
                .email("dev@smartdocs.de")
                .build();

        /*
         * Criamos um documento falso como se ele já existisse no banco.
         *
         * Ele começa como PENDING porque ainda será processado.
         */
        Document document = Document.builder()
                .filename("contrato-com-erro.pdf")
                .originalFilename("contrato-com-erro.pdf")
                .filePath(pdfPath.toString())
                .status(Document.DocumentStatus.PENDING)
                .uploadedBy(user)
                .build();

        // Colocamos manualmente o ID no documento.
        ReflectionTestUtils.setField(
                document,
                "id",
                documentId
        );

        // Quando procurar o documento pelo ID, devolve o documento fake.
        when(documentRepo.findById(documentId))
                .thenReturn(Optional.of(document));

        /*
         * Aqui simulamos uma falha da IA.
         *
         * No mundo real isso poderia acontecer por:
         * - chave inválida
         * - API fora do ar
         * - timeout
         * - resposta inválida
         */
        when(claudeService.analyzeDocument(any(), eq("contrato-com-erro.pdf")))
                .thenThrow(new RuntimeException("Falha simulada da IA"));

        // WHEN significa: executando a ação testada.
        documentService.processDocument(documentId);

        // THEN significa: verificando o resultado esperado.

        // Verifica se o status mudou para ERROR.
        assertThat(document.getStatus())
                .isEqualTo(Document.DocumentStatus.ERROR);

        // Verifica se a mensagem de erro foi salva no documento.
        assertThat(document.getErrorMessage())
                .contains("Falha simulada da IA");

        // Verifica se o documento foi salvo depois da falha.
        verify(documentRepo, times(1))
                .save(document);

        // Verifica se a IA foi chamada uma vez.
        verify(claudeService, times(1))
                .analyzeDocument(any(), eq("contrato-com-erro.pdf"));

        // Como deu erro, nenhuma tarefa deve ser criada.
        verify(taskRepo, never())
                .save(any());

        // Verifica se a auditoria de erro foi registrada.
        verify(auditService, times(1))
                .log(
                        eq("ERROR"),
                        eq("Document"),
                        eq(documentId.toString()),
                        contains("Falha simulada da IA")
                );
    }
}