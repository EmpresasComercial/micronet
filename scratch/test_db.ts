import { supabase } from '../src/lib/supabase';

async function test() {
  console.log('Testing support_feedback_mcpn...');
  const { error } = await supabase.from('support_feedback_mcpn').insert({ mensagem: 'test' });
  if (error) {
    console.log('support_feedback_mcpn Error:', error.message);
  } else {
    console.log('support_feedback_mcpn SUCCESS!');
  }

  console.log('Testing suporte_feedback_mcpn...');
  const { error: error2 } = await supabase.from('suporte_feedback_mcpn').insert({ mensagem: 'test' });
  if (error2) {
    console.log('suporte_feedback_mcpn Error:', error2.message);
  } else {
    console.log('suporte_feedback_mcpn SUCCESS!');
  }

  console.log('Testing feedbacks_suporte_mcpn...');
  const { error: error3 } = await supabase.from('feedbacks_suporte_mcpn').insert({ mensagem: 'test' });
  if (error3) {
    console.log('feedbacks_suporte_mcpn Error:', error3.message);
  } else {
    console.log('feedbacks_suporte_mcpn SUCCESS!');
  }
}

test();
