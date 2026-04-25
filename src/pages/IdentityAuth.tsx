import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ShieldCheck, Info, User, CreditCard, ChevronDown, Camera, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/Toast';
import { Button } from '../components/Button';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

const PROVINCES = [
  'Bengo', 'Benguela', 'Bié', 'Cabinda', 'Cuando', 'Cubango', 
  'Cuanza Norte', 'Cuanza Sul', 'Cunene', 'Huambo', 'Huíla', 
  'Luanda', 'Lunda Norte', 'Lunda Sul', 'Malanje', 'Moxico-Leste', 
  'Moxico-Sul', 'Namibe', 'Uíge', 'Zaire'
];

export default function IdentityAuth() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<string | null>(null);
  const [frenteFile, setFrenteFile] = useState<File | null>(null);
  const [versoFile, setVersoFile] = useState<File | null>(null);
  const [frentePreview, setFrentePreview] = useState<string | null>(null);
  const [versoPreview, setVersoPreview] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    idNumber: '',
    province: '',
  });

  useEffect(() => {
    async function fetchStatus() {
      try {
        const { data, error } = await supabase.rpc('get_my_verification_status_mcpn');
        if (error) throw error;
        if (data && data.length > 0) {
          setCurrentStatus(data[0].status);
        }
      } catch (err) {
        console.error('Erro ao buscar status:', err);
      }
    }
    fetchStatus();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, side: 'frente' | 'verso') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('A imagem deve ter no máximo 5MB.', 'error');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        if (side === 'frente') {
          setFrenteFile(file);
          setFrentePreview(reader.result as string);
        } else {
          setVersoFile(file);
          setVersoPreview(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (val.length <= 14) {
      setFormData({ ...formData, idNumber: val });
    }
  };

  const uploadFile = async (file: File, path: string) => {
    const { data, error } = await supabase.storage
      .from('verificacoes')
      .upload(path, file, { upsert: true });
    
    if (error) throw error;
    return data.path;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || formData.fullName.length < 5) {
      showToast('Por favor, insira o nome completo conforme o seu BI.', 'error');
      return;
    }
    if (formData.idNumber.length !== 14) {
      showToast('O número do BI deve ter exatamente 14 caracteres.', 'error');
      return;
    }
    if (!formData.province) {
      showToast('Selecione a sua província de residência.', 'error');
      return;
    }
    if (!frenteFile || !versoFile) {
      showToast('Por favor, selecione as fotos da frente e verso do seu BI.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      const timestamp = Date.now();
      const frentePath = await uploadFile(frenteFile, `${user.id}/frente_${timestamp}.jpg`);
      const versoPath = await uploadFile(versoFile, `${user.id}/verso_${timestamp}.jpg`);

      const { data, error } = await supabase.rpc('submit_identity_verification_mcpn', {
        p_nome: formData.fullName,
        p_bi_numero: formData.idNumber,
        p_frente_path: frentePath,
        p_verso_path: versoPath
      });

      if (error) throw error;

      if (data.success) {
        showToast(data.message, 'success');
        setCurrentStatus('pendente');
      } else {
        showToast(data.message, 'error');
      }
    } catch (error: any) {
      showToast(error.message || 'Erro ao enviar documentos', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStatus === 'verificado') {
    return (
      <div className="min-h-screen bg-[#f2f2f2] flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Conta Verificada</h2>
        <p className="text-gray-600 max-w-xs mb-8">Sua identidade foi autenticada com sucesso pelos servidores da Microsoft.</p>
        <Button onClick={() => navigate('/perfil')}>Voltar ao Perfil</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f2f2] pb-20">
      <header className="bg-white p-4 flex items-center border-b border-[#e1e1e1] sticky top-0 z-50">
        <button 
          onClick={() => navigate('/configuracoes-conta')} 
          className="p-2 -ml-2 text-[#616161]"
          aria-label="Voltar para configurações"
          title="Voltar"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-sm font-semibold ml-2 text-[#2b2b2b]">Verificação de Identidade</h1>
      </header>

      <div className="p-6 max-w-lg mx-auto">
        <div className="mb-8 text-left">
          <div className="flex items-center space-x-2 text-[#107c10] mb-2">
            <ShieldCheck size={16} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Proteção PGP Ativa</span>
          </div>
          <h2 className="text-3xl font-light text-[#2b2b2b] mb-3">Autentique sua conta</h2>
          <p className="text-sm text-[#616161] leading-relaxed">Para garantir a segurança das transações, precisamos validar seus documentos oficiais.</p>
        </div>

        {currentStatus === 'pendente' ? (
          <div className="bg-white border border-[#e1e1e1] p-10 rounded-sm text-center space-y-4">
             <div className="w-16 h-16 bg-blue-50 text-ms-blue rounded-full flex items-center justify-center mx-auto animate-pulse">
                <ShieldCheck size={32} />
             </div>
             <h3 className="text-lg font-bold">Verificação em Curso</h3>
             <p className="text-sm text-gray-500">Seus documentos foram recebidos e estão sendo analisados. Isso pode levar até 24h.</p>
             <Button className="w-full" onClick={() => navigate('/perfil')}>Entendido</Button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#e1e1e1] shadow-sm p-8 rounded-sm text-left"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Nome Completo (Conforme BI)</label>
                <div className="relative">
                  <input
                    type="text"
                    className="input-field pr-10"
                    placeholder="Introduza seu nome completo"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Número do BI (14 Caracteres)</label>
                <div className="relative">
                  <input
                    type="text"
                    className="input-field pr-10 font-mono tracking-wider"
                    placeholder="Ex: 004123456LA048"
                    value={formData.idNumber}
                    onChange={handleIdChange}
                  />
                  <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </div>
                <p className="text-[9px] text-gray-400 mt-1 font-bold">Dígitos: {formData.idNumber.length} / 14</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="file" 
                  id="frenteInput" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'frente')}
                  title="Foto da Frente do BI"
                  aria-label="Carregar foto da frente do BI"
                />
                <input 
                  type="file" 
                  id="versoInput" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, 'verso')}
                  title="Foto do Verso do BI"
                  aria-label="Carregar foto do verso do BI"
                />
                
                <div 
                  className={cn(
                    "border-2 border-dashed p-4 rounded flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all overflow-hidden relative min-h-[100px]",
                    frentePreview ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => document.getElementById('frenteInput')?.click()}
                >
                   {frentePreview ? (
                     <img src={frentePreview} alt="Frente" className="absolute inset-0 w-full h-full object-contain opacity-50" />
                   ) : (
                     <Camera className="text-ms-blue w-6 h-6" />
                   )}
                   <span className="text-[9px] font-bold uppercase text-gray-500 relative z-10">
                     {frentePreview ? 'Trocar Frente' : 'Frente do BI'}
                   </span>
                </div>

                <div 
                  className={cn(
                    "border-2 border-dashed p-4 rounded flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all overflow-hidden relative min-h-[100px]",
                    versoPreview ? "border-green-500 bg-green-50" : "border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => document.getElementById('versoInput')?.click()}
                >
                   {versoPreview ? (
                     <img src={versoPreview} alt="Verso" className="absolute inset-0 w-full h-full object-contain opacity-50" />
                   ) : (
                     <Camera className="text-ms-blue w-6 h-6" />
                   )}
                   <span className="text-[9px] font-bold uppercase text-gray-500 relative z-10">
                     {versoPreview ? 'Trocar Verso' : 'Verso do BI'}
                   </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Província de Residência</label>
                <div className="relative">
                  <select 
                    className="input-field cursor-pointer py-2 pr-10 appearance-none bg-white font-medium"
                    value={formData.province}
                    onChange={(e) => setFormData({...formData, province: e.target.value})}
                    aria-label="Selecionar Província"
                    title="Província"
                  >
                    <option value="" disabled>Selecionar Província</option>
                    {PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>{prov}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                </div>
              </div>

              <div className="pt-4">
                <Button 
                  type="submit"
                  className="w-full"
                  isLoading={isSubmitting}
                >
                  Enviar para Verificação
                </Button>
              </div>
            </form>
          </motion.div>
        )}



        <div className="text-center pt-12 pb-12">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.2em]">
            Microsoft Official Verification Node
          </p>
        </div>
      </div>
    </div>
  );
}
