import { Hono } from 'hono';
import { supabase } from './supabase';

const transactions = new Hono();

// ============================================
// MIDDLEWARE - VERIFY JWT TOKEN
// ============================================
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Token tidak ditemukan' }, 401);
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return c.json({ error: 'Token tidak valid' }, 401);
    }

    c.set('user', user);
    await next();
  } catch (error) {
    return c.json({ error: 'Autentikasi gagal' }, 401);
  }
};

// ============================================
// GET USER TRANSACTIONS
// ============================================
transactions.get('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // Ambil transaksi yang terkait dengan user
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching transactions:', error);
      return c.json({ error: 'Gagal mengambil data transaksi' }, 500);
    }

    return c.json(data || []);
  } catch (error: any) {
    console.error('Get transactions error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// GET SINGLE TRANSACTION
// ============================================
transactions.get('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching transaction:', error);
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Transaksi tidak ditemukan' }, 404);
      }
      return c.json({ error: 'Gagal mengambil data transaksi' }, 500);
    }

    return c.json(data);
  } catch (error: any) {
    console.error('Get transaction error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// CREATE TRANSACTION
// ============================================
transactions.post('/', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const body = await c.req.json();

    const { amount, description, type, category } = body;

    if (!amount || !type) {
      return c.json({ error: 'Amount dan type wajib diisi' }, 400);
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount,
        description,
        type, // 'income' atau 'expense'
        category,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating transaction:', error);
      return c.json({ error: 'Gagal membuat transaksi' }, 500);
    }

    return c.json(data, 201);
  } catch (error: any) {
    console.error('Create transaction error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// UPDATE TRANSACTION
// ============================================
transactions.put('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    const body = await c.req.json();

    const allowedFields = ['amount', 'description', 'type', 'category'];
    const updateData: any = {};

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return c.json({ error: 'Tidak ada data untuk diupdate' }, 400);
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating transaction:', error);
      if (error.code === 'PGRST116') {
        return c.json({ error: 'Transaksi tidak ditemukan' }, 404);
      }
      return c.json({ error: 'Gagal mengupdate transaksi' }, 500);
    }

    return c.json(data);
  } catch (error: any) {
    console.error('Update transaction error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// DELETE TRANSACTION
// ============================================
transactions.delete('/:id', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    const id = c.req.param('id');
    
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting transaction:', error);
      return c.json({ error: 'Gagal menghapus transaksi' }, 500);
    }

    return c.json({ message: 'Transaksi berhasil dihapus' });
  } catch (error: any) {
    console.error('Delete transaction error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

// ============================================
// GET TRANSACTION SUMMARY
// ============================================
transactions.get('/summary/stats', authMiddleware, async (c) => {
  try {
    const user = c.get('user');
    
    // Ambil semua transaksi user
    const { data, error } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching transaction summary:', error);
      return c.json({ error: 'Gagal mengambil ringkasan transaksi' }, 500);
    }

    // Hitung total income dan expense
    const summary = (data || []).reduce((acc: any, transaction: any) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
      } else if (transaction.type === 'expense') {
        acc.totalExpense += transaction.amount;
      }
      return acc;
    }, { totalIncome: 0, totalExpense: 0 });

    summary.balance = summary.totalIncome - summary.totalExpense;
    summary.transactionCount = data?.length || 0;

    return c.json(summary);
  } catch (error: any) {
    console.error('Get transaction summary error:', error);
    return c.json({ error: 'Terjadi kesalahan server' }, 500);
  }
});

export default transactions;
