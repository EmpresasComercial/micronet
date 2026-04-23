import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, ChevronDown, ChevronUp, HelpCircle, ArrowRight, Home, Search, BookOpen, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { useToast } from '../components/Toast';
import { useLanguage } from '../contexts/LanguageContext';

interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

export default function HelpFAQ() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { t } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default like MS docs

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const faqData: FAQItem[] = [
    {
      question: t('faq.q1'),
      answer: (
        <div className="space-y-4 text-gray-700 text-left">
          <p>A recarga de conta na plataforma Microsoft Cloud platform Net é simples e segura. Siga os passos indicados abaixo:</p>
          <div className="bg-gray-50 border-l-4 border-ms-blue p-4 text-sm italic mb-4">
            Nota: Certifique-se de que o comprovativo de transferência é legível se solicitado pelo sistema.
          </div>
          <ol className="list-decimal ml-6 space-y-3">
            <li>Navegue até à sua área de <strong>Perfil</strong>.</li>
            <li>Selecione <strong>Recarregar</strong> para pagamentos em Kwanza ou <strong>Recargar USDT</strong> para criptomoedas.</li>
            <li>Introduza o montante pretendido (o limite mínimo é de 5.000 Kz ou 5 USDT).</li>
            <li>Conclua a transferência para os dados bancários ou para o endereço de carteira que lhe será fornecido.</li>
            <li>O processamento é automático, mas pode demorar entre 5 a 30 minutos em períodos de alta procura.</li>
          </ol>
          <div className="pt-2">
            <Link to="/recarregar" className="inline-flex items-center text-ms-blue font-semibold hover:underline decoration-2 underline-offset-4">
              Ir para a página de recarga <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      )
    },
    {
      question: t('faq.q2'),
      answer: (
        <div className="space-y-4 text-gray-700 text-left">
          <p>Para processar um levantamento com sucesso na Microsoft Cloud platform Net, siga estas diretrizes:</p>
          <ul className="list-disc ml-6 space-y-3">
            <li><strong>Vinculação:</strong> Antes de retirar, deve ter os seus dados bancários configurados na seção "Vinculação Bancária".</li>
            <li><strong>Horário:</strong> Os levantamentos são processados todos os dias úteis entre as 09:00 e as 22:00.</li>
            <li><strong>Taxas:</strong> Existe uma taxa de administração padrão aplicada a cada transferência para cobrir custos de rede interbancária.</li>
          </ul>
          <div className="pt-2">
            <Link to="/retirada" className="inline-flex items-center text-ms-blue font-semibold hover:underline decoration-2 underline-offset-4">
              Solicitar levantamento seguro <ExternalLink className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      )
    },
    {
      question: t('faq.q3'),
      answer: (
        <div className="space-y-4 text-gray-700 text-left">
          <p>Os seus nós de computação em nuvem precisam de ser ativados diariamente para gerar operações:</p>
          <ol className="list-decimal ml-6 space-y-3">
            <li>No menu principal, aceda a <strong>Operações</strong>.</li>
            <li>Acione o botão central para iniciar o processamento dos dados.</li>
            <li>O sistema irá realizar a validação de blocos de dados na rede Azure da Microsoft Cloud platform Net.</li>
            <li>Mantenha a página aberta até completar 100%. O lucro será creditado assim que a tarefa terminar.</li>
          </ol>
          <Link to="/operacoes" className="inline-flex items-center text-ms-blue font-semibold hover:underline decoration-2 underline-offset-4">
            Começar operações diárias <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )
    },
    {
      question: t('faq.q4'),
      answer: (
        <div className="space-y-4 text-gray-700 text-left">
          <p>A transparência é fundamental no nosso sistema de licenciamento:</p>
          <p>Todos os produtos da Microsoft Cloud platform Net (como o Azure Starter ou o Enterprise Storage) operam num ciclo operacional de <strong>30 dias</strong>.</p>
          <div className="bg-blue-50 border border-blue-100 p-4 rounded text-sm text-blue-800">
            <strong>Dica Pro:</strong> Receberá uma notificação 24 horas antes do fim do contrato do seu produto para que possa renovar ou atualizar para um nível superior sem interrupção de rendimentos.
          </div>
          <Link to="/produtos" className="inline-flex items-center text-ms-blue font-semibold hover:underline decoration-2 underline-offset-4">
            Explorar catálogo de licenças <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )
    },
    {
      question: t('faq.q5'),
      answer: (
        <div className="space-y-4 text-gray-700 text-left">
          <p>A Microsoft Cloud platform Net é um ecossistema de computação em nuvem que permite a utilizadores individuais participarem na expansão da infraestrutura digital.</p>
          <p>Ao adquirir uma licença, o utilizador está a financiar o poder computacional necessário para executar algoritmos de inteligência artificial e processamento de dados em larga escala. Em troca dessa participação, a plataforma partilha uma percentagem dos lucros gerados por essas operações corporativas diretamente com o utilizador.</p>
          <Link to="/sobre-microsoft" className="inline-flex items-center text-ms-blue font-semibold hover:underline decoration-2 underline-offset-4">
            Consultar visão e missão <ExternalLink className="w-4 h-4 ml-2" />
          </Link>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Microsoft Sticky Header */}
      <header className="bg-white px-4 py-3 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <div className="flex items-center max-w-5xl mx-auto w-full">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-sm transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="ml-4 flex items-center text-xs font-semibold text-gray-500 uppercase tracking-widest space-x-2">
            <Link to="/home" className="hover:text-ms-blue flex items-center"><Home size={12} className="mr-1" /> {t('common.home')}</Link>
            <span>/</span>
            <Link to="/suporte" className="hover:text-ms-blue">{t('faq.breadcrumb_support') || 'Suporte'}</Link>
            <span>/</span>
            <span className="text-gray-900">FAQ</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20 text-left">
        {/* Article Style Heading */}
        <section className="mb-16">
          <div className="flex items-center space-x-3 text-ms-blue mb-4">
            <BookOpen size={24} />
            <span className="text-sm font-bold uppercase tracking-widest">{t('faq.doc_label') || 'Documentação Oficial'}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
            {t('faq.hero_title')}
          </h1>
          <p className="text-xl text-gray-500 font-light leading-relaxed">
            {t('faq.hero_sub')}
          </p>
        </section>

        {/* FAQ List - Microsoft Accordion Style */}
        <div className="divide-y divide-[#e1e1e1] border-t border-b border-[#e1e1e1]">
          {faqData.map((item, idx) => (
            <div key={idx} className="bg-white">
              <button 
                onClick={() => toggleFAQ(idx)}
                className="w-full py-6 flex items-center justify-between text-left group"
              >
                <span className={cn(
                  "text-lg font-bold transition-colors pr-8",
                  openIndex === idx ? "text-ms-blue" : "text-gray-900 group-hover:text-ms-blue"
                )}>
                  {item.question}
                </span>
                {openIndex === idx ? (
                  <ChevronUp className="w-5 h-5 text-ms-blue shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-400 shrink-0 group-hover:text-gray-900" />
                )}
              </button>
              
              <AnimatePresence>
                {openIndex === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pb-10 pt-2 leading-relaxed">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Feedback Section - Native MS style */}
        <div className="mt-20 pt-8 border-t border-[#e1e1e1] flex flex-col md:flex-row items-center justify-between">
          <span className="text-sm font-semibold text-gray-900 mb-4 md:mb-0">{t('faq.feedback_useful')}</span>
          <div className="flex space-x-3">
            <button 
              onClick={() => showToast(t('faq.feedback_thanks'), 'success')}
              className="px-8 py-2 border border-gray-900 text-sm font-bold hover:bg-gray-50 active:scale-95 transition-all"
            >
              {t('faq.yes')}
            </button>
            <button 
              onClick={() => navigate('/suporte')}
              className="px-8 py-2 border border-gray-900 text-sm font-bold hover:bg-gray-50 active:scale-95 transition-all"
            >
              {t('faq.no')}
            </button>
          </div>
        </div>

        <div className="mt-32 text-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg" 
            alt="Microsoft" 
            className="h-4 mx-auto mb-6 opacity-30 grayscale"
            referrerPolicy="no-referrer"
          />
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">
            {t('about.rights')}
          </p>
        </div>
      </main>
    </div>
  );
}
