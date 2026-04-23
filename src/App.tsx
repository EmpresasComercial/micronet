/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import { ToastProvider } from './components/Toast';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider } from './contexts/AuthContext'; // Contexto Global de Auth
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Products from './pages/Products';
import Invite from './pages/Invite';
import Profile from './pages/Profile';
import AddBank from './pages/AddBank';
import ChangePassword from './pages/ChangePassword';
import AccountSettings from './pages/AccountSettings';
import Recharge from './pages/Recharge';
import Support from './pages/Support';
import Withdraw from './pages/Withdraw';
import BankInfo from './pages/BankInfo';
import IdentityAuth from './pages/IdentityAuth';
import WithdrawalHistory from './pages/WithdrawalHistory';
import RechargeHistory from './pages/RechargeHistory';
import RechargeHistoryUSDT from './pages/RechargeHistoryUSDT';
import GeneralHistory from './pages/GeneralHistory';
import RedeemCoupon from './pages/RedeemCoupon';
import PurchaseHistory from './pages/PurchaseHistory';
import MyTeam from './pages/MyTeam';
import Operations from './pages/Operations';
import RechargeUSDT from './pages/RechargeUSDT';
import ProductDetails from './pages/ProductDetails';
import AboutMicrosoft from './pages/AboutMicrosoft';
import HelpFAQ from './pages/HelpFAQ';
import SupportFeedback from './pages/SupportFeedback';
import SocialProof from './pages/SocialProof';

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider> {/* O Escudo Invisível envolve tudo */}
            <Routes>
              {/* 🔓 Rotas Públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Signup />} />

              {/* 🔒 Rotas Protegidas (Exigem Login) */}
              <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                <Route index element={<Navigate to="/home" replace />} />
                <Route path="home" element={<Home />} />
                <Route path="produtos" element={<Products />} />
                <Route path="produtos/:id" element={<ProductDetails />} />
                <Route path="convite" element={<Invite />} />
                <Route path="perfil" element={<Profile />} />
                <Route path="adicionar-banco" element={<AddBank />} />
                <Route path="alterar-senha" element={<ChangePassword />} />
                <Route path="configuracoes-conta" element={<AccountSettings />} />
                <Route path="recarregar" element={<Recharge />} />
                <Route path="suporte" element={<Support />} />
                <Route path="retirada" element={<Withdraw />} />
                <Route path="informacao-bancaria" element={<BankInfo />} />
                <Route path="autenticacao" element={<IdentityAuth />} />
                <Route path="registro-retirada" element={<WithdrawalHistory />} />
                <Route path="registro-recarga" element={<RechargeHistory />} />
                <Route path="registro-recarga-usdt" element={<RechargeHistoryUSDT />} />
                <Route path="historico-atividades" element={<GeneralHistory />} />
                <Route path="resgate" element={<RedeemCoupon />} />
                <Route path="minhas-compras" element={<PurchaseHistory />} />
                <Route path="equipe" element={<MyTeam />} />
                <Route path="operacoes" element={<Operations />} />
                <Route path="recharge-usdt" element={<RechargeUSDT />} />
                <Route path="sobre-microsoft" element={<AboutMicrosoft />} />
                <Route path="help-faq" element={<HelpFAQ />} />
                <Route path="suporte/feedback" element={<SupportFeedback />} />
                <Route path="provas-social" element={<SocialProof />} />
              </Route>

              {/* Redirecionamento Global */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </LanguageProvider>
  );
}
