import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, FileText, Home, Settings, 
  Bell, Search, Plus, DollarSign, 
  Shield, ChevronRight, Menu, X, LogOut, UserPlus, 
  Phone, Mail, CheckCircle, Edit, Cloud, 
  PieChart, TrendingUp, Lock, Download, AlertTriangle, 
  Trash2, PenTool, UploadCloud, Send, Clock, Eye, File
} from 'lucide-react';

// --- IMPORTS FIREBASE ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged, 
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  deleteDoc, 
  updateDoc,
  doc, 
  serverTimestamp,
  orderBy 
} from 'firebase/firestore';

// ==================================================================
// ZONE DE CONFIGURATION (C'EST ICI QUE VOUS COLLEZ VOS CLÉS)
// ==================================================================

const firebaseConfig = {
  apiKey: "AIzaSyCNC074FtqfYaHtVFO185gsfOMLNfBrU2c",
  authDomain: "cabinet-gestion.firebaseapp.com",
  projectId: "cabinet-gestion",
  storageBucket: "cabinet-gestion.firebasestorage.app",
  messagingSenderId: "510936356576",
  appId: "1:510936356576:web:434d05bc5eb31972ebe285"
};

// ==================================================================
// INITIALISATION (NE PAS TOUCHER EN DESSOUS)
// ==================================================================

// On initialise l'app une seule fois ici pour éviter les erreurs
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'mon-cabinet-app'; // Identifiant unique interne

// --- COMPOSANTS UI (BOUTONS, BADGES...) ---

const Button = ({ children, onClick, variant = 'primary', className = "", icon: Icon, size="md", disabled=false }) => {
  const baseStyle = "rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-4 py-3 text-base" };
  const variants = {
    primary: "bg-slate-900 text-white hover:bg-slate-800 shadow-md",
    secondary: "bg-white text-slate-700 border border-slate-300 hover:bg-slate-50",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
    success: "bg-emerald-600 text-white hover:bg-emerald-700",
    orange: "bg-orange-500 text-white hover:bg-orange-600"
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${sizes[size]} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={size === 'sm' ? 14 : 18} />}
      {children}
    </button>
  );
};

const Badge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-emerald-50 text-emerald-700 border-emerald-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    purple: "bg-purple-50 text-purple-700 border-purple-100",
    red: "bg-red-50 text-red-700 border-red-100",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide font-bold border ${colors[color] || colors.blue}`}>{children}</span>;
};

// --- ECRAN DE CONNEXION (PRO & CLIENT) ---
const AuthScreen = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('advisor');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin(role); 
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-center gap-3 mb-6 text-slate-900">
          <div className="bg-blue-600 p-2 rounded-lg text-white"><Shield size={24} /></div>
          <h1 className="text-2xl font-bold">WealthPro <span className="text-blue-600">Connect</span></h1>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg mb-6">
            <button onClick={() => setRole('advisor')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'advisor' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Espace Conseiller</button>
            <button onClick={() => setRole('client')} className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${role === 'client' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}>Espace Client</button>
        </div>

        <h2 className="text-center text-slate-500 mb-6 font-medium">
          {isRegistering ? "Créer un compte" : (role === 'advisor' ? "Connexion Pro" : "Accès Portfolio")}
        </h2>

        {error && <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 flex items-center gap-2"><AlertTriangle size={16}/>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
            <input type="email" required className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mot de passe</label>
             <input type="password" required minLength={6} className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <Button className="w-full py-3 mt-2" icon={Lock}>
            {isRegistering ? "S'inscrire" : "Se Connecter"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-blue-600 hover:underline">
            {isRegistering ? "Retour connexion" : "Créer un compte (Demo)"}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PORTAIL CLIENT ---
const ClientPortal = ({ user, onLogout }) => {
    const portfolio = {
        total: 145000,
        performance: "+4.2%",
        docs: [
            { name: "Lettre de mission.pdf", date: "12/10/2024", type: "Signed" },
            { name: "Bilan Patrimonial.pdf", date: "15/10/2024", type: "Report" }
        ]
    };

    return (
        <div className="h-screen bg-slate-50 font-sans overflow-y-auto">
            <header className="bg-white border-b p-4 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-emerald-600 text-white p-2 rounded"><Shield size={20}/></div>
                        <h1 className="font-bold text-slate-800">Mon Espace <span className="text-emerald-600">Privé</span></h1>
                    </div>
                    <Button variant="secondary" size="sm" onClick={onLogout} icon={LogOut}>Sortir</Button>
                </div>
            </header>
            
            <main className="max-w-4xl mx-auto p-4 space-y-6">
                <div className="bg-slate-900 text-white rounded-2xl p-8 shadow-lg">
                    <p className="text-slate-400 uppercase text-xs font-bold tracking-wider mb-2">Situation Globale</p>
                    <h2 className="text-4xl font-bold mb-2">{portfolio.total.toLocaleString()} €</h2>
                    <div className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-sm">
                        <TrendingUp size={16} /> Performance YTD: {portfolio.performance}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><PieChart className="text-slate-400"/> Allocation</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between text-sm"><span className="text-slate-600">Assurance Vie</span><span className="font-bold">65%</span></div>
                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '65%'}}></div></div>
                            <div className="flex justify-between text-sm"><span className="text-slate-600">PEA / Actions</span><span className="font-bold">25%</span></div>
                            <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-indigo-500 h-2 rounded-full" style={{width: '25%'}}></div></div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText className="text-slate-400"/> Mes Documents</h3>
                        <div className="space-y-3">
                            {portfolio.docs.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition">
                                    <div className="flex items-center gap-3">
                                        <div className="text-red-500"><FileText size={20}/></div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-800">{doc.name}</p>
                                            <p className="text-xs text-slate-500">{doc.date}</p>
                                        </div>
                                    </div>
                                    {doc.type === 'Signed' && <Badge color="green">Signé</Badge>}
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
};

// --- APPLICATION PRINCIPALE (CONSEILLER) ---
export default function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [clients, setClients] = useState([]);
  
  // UI States
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Gestion Automatisations (Demo)
  const [automations, setAutomations] = useState([
      { id: 1, name: "Joyeux Anniversaire", trigger: "Date naissance", status: "Active", lastRun: "Hier 09:00" },
      { id: 2, name: "Rappel Déclaration 2042", trigger: "15 Avril", status: "Paused", lastRun: "15/04/2024" },
  ]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || role === 'client') return;
    const qClients = query(collection(db, 'artifacts', appId, 'public', 'data', 'clients'), orderBy('createdAt', 'desc'));
    const unsubClients = onSnapshot(qClients, s => setClients(s.docs.map(d => ({id:d.id, ...d.data()}))));
    return () => unsubClients();
  }, [user, role]);

  const handleSaveClient = async (e) => {
      e.preventDefault();
      const formData = new FormData(e.target);
      const data = {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          aum: formData.get('aum'),
          status: formData.get('status'),
          updatedAt: serverTimestamp(),
      };

      if (editingClient?.id) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'clients', editingClient.id), data);
      } else {
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'clients'), {
              ...data, createdBy: user.uid, createdAt: serverTimestamp()
          });
      }
      setShowClientModal(false);
      setEditingClient(null);
  };

  const triggerAutomation = (id) => {
      alert(`Simulation : Email de campagne envoyé à ${clients.filter(c => c.status === 'Actif').length} clients actifs.`);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50">Chargement...</div>;
  if (!user) return <AuthScreen onLogin={(r) => setRole(r)} />;
  if (role === 'client') return <ClientPortal user={user} onLogout={() => { signOut(auth); setRole(null); }} />;

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white h-full shadow-xl z-20">
        <div className="p-6 flex items-center gap-2 border-b border-slate-800">
           <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center"><Shield size={18}/></div>
           <div><span className="font-bold text-lg block leading-none">Wealth<span className="text-blue-400">Pro</span></span><span className="text-[10px] text-slate-400 font-medium">Suite V4</span></div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
            <SidebarBtn id="dashboard" icon={Home} label="Tableau de Bord" active={activeTab} set={setActiveTab} />
            <SidebarBtn id="clients" icon={Users} label="Portefeuille" active={activeTab} set={setActiveTab} />
            <SidebarBtn id="automation" icon={Send} label="Automatisations" active={activeTab} set={setActiveTab} />
            <SidebarBtn id="admin" icon={Settings} label="Configuration" active={activeTab} set={setActiveTab} />
        </nav>
        <div className="p-4 border-t border-slate-800">
            <Button variant="secondary" size="sm" className="w-full" onClick={() => signOut(auth)} icon={LogOut}>Déconnexion</Button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
         <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
             <h2 className="text-xl font-bold text-slate-800 capitalize">{activeTab === 'automation' ? 'Marketing & Automation' : activeTab}</h2>
             <div className="flex items-center gap-3">
                {activeTab === 'clients' && (
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                        <input className="pl-9 pr-4 py-2 bg-slate-100 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none w-64"
                            placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                    </div>
                )}
             </div>
         </header>

         <div className="flex-1 overflow-y-auto p-4 md:p-8">
            {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <Card className="p-6 border-l-4 border-blue-600"><p className="text-slate-500 text-xs font-bold uppercase">Encours</p><p className="text-3xl font-bold mt-1">{clients.reduce((acc,c) => acc + Number(c.aum||0), 0).toLocaleString()} €</p></Card>
                        <Card className="p-6 border-l-4 border-emerald-500"><p className="text-slate-500 text-xs font-bold uppercase">Clients</p><p className="text-3xl font-bold mt-1">{clients.length}</p></Card>
                        <Card className="p-6 border-l-4 border-orange-500"><p className="text-slate-500 text-xs font-bold uppercase">Signatures</p><p className="text-3xl font-bold mt-1">3 <span className="text-sm text-slate-400 font-normal">attente</span></p></Card>
                        <Card className="p-6 border-l-4 border-purple-500"><p className="text-slate-500 text-xs font-bold uppercase">Campagnes</p><p className="text-3xl font-bold mt-1">120 <span className="text-sm text-slate-400 font-normal">envoyés</span></p></Card>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card className="p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><PenTool size={18} className="text-orange-500"/> Dernières Signatures</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded border-l-2 border-green-500"><span className="text-sm font-medium">M. Dupont - Lettre de mission</span><Badge color="green">Signé 14:00</Badge></div>
                                <div className="flex justify-between items-center p-2 bg-slate-50 rounded border-l-2 border-orange-400"><span className="text-sm font-medium">Mme. Martin - Mandat</span><Badge color="amber">En attente</Badge></div>
                            </div>
                        </Card>
                    </div>
                </div>
            )}

            {activeTab === 'automation' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-between items-center"><p className="text-slate-500">Gérez vos envois automatiques.</p><Button icon={Plus}>Nouvelle Règle</Button></div>
                    <div className="grid grid-cols-1 gap-4">
                        {automations.map(auto => (
                            <Card key={auto.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-start gap-4">
                                    <div className={`p-3 rounded-lg ${auto.status === 'Active' ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}><Send size={24} /></div>
                                    <div><h4 className="font-bold text-lg text-slate-800">{auto.name}</h4><div className="flex items-center gap-4 text-sm text-slate-500 mt-1"><span className="flex items-center gap-1"><Clock size={14}/> {auto.trigger}</span><span className="flex items-center gap-1"><CheckCircle size={14}/> {auto.lastRun}</span></div></div>
                                </div>
                                <div className="flex items-center gap-3"><Badge color={auto.status === 'Active' ? 'green' : 'amber'}>{auto.status}</Badge><Button variant="secondary" size="sm" onClick={() => triggerAutomation(auto.id)}>Forcer l'envoi</Button></div>
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'clients' && (
                <div className="space-y-6 animate-fadeIn">
                    <div className="flex justify-end"><Button onClick={() => { setEditingClient(null); setShowClientModal(true); }} icon={UserPlus}>Nouveau Dossier</Button></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredClients.map(c => (
                             <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-all relative group">
                                 <div className="flex justify-between items-start mb-3">
                                     <div className="flex items-center gap-3">
                                         <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold">{c.name?.charAt(0)}</div>
                                         <div><h3 className="font-bold text-slate-800">{c.name}</h3><Badge color={c.status==='Actif'?'green':'amber'}>{c.status}</Badge></div>
                                     </div>
                                     <button onClick={() => { setEditingClient(c); setShowClientModal(true); }} className="p-2 text-slate-400 hover:text-blue-600"><Edit size={18}/></button>
                                 </div>
                                 <div className="flex gap-2 mt-4 border-t pt-3">
                                     <Button variant="ghost" size="sm" className="flex-1 text-xs" icon={FileText}>Docs</Button>
                                     <Button variant="ghost" size="sm" className="flex-1 text-xs" icon={PenTool}>Signer</Button>
                                 </div>
                             </div>
                        ))}
                    </div>
                </div>
            )}
         </div>
      </main>

      {showClientModal && <ClientDetailModal client={editingClient} onClose={() => setShowClientModal(false)} onSave={handleSaveClient} />}
    </div>
  );
}

// --- MODAL DÉTAIL CLIENT ---
const ClientDetailModal = ({ client, onClose, onSave }) => {
    const [tab, setTab] = useState('info');
    const [files, setFiles] = useState([
        {name: 'KYC_2024.pdf', size: '1.2 MB', date: '12/10/2024'},
    ]); 

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center bg-slate-50 rounded-t-xl">
                    <h3 className="text-xl font-bold text-slate-800">{client ? client.name : 'Nouveau Dossier'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full"><X size={20}/></button>
                </div>
                <div className="flex border-b px-6">
                    <button onClick={() => setTab('info')} className={`py-3 px-4 text-sm font-medium border-b-2 ${tab==='info'?'border-blue-600 text-blue-600':'border-transparent text-slate-500'}`}>Infos</button>
                    <button onClick={() => setTab('ged')} className={`py-3 px-4 text-sm font-medium border-b-2 ${tab==='ged'?'border-blue-600 text-blue-600':'border-transparent text-slate-500'}`}>GED</button>
                    <button onClick={() => setTab('sign')} className={`py-3 px-4 text-sm font-medium border-b-2 ${tab==='sign'?'border-blue-600 text-blue-600':'border-transparent text-slate-500'}`}>Signatures</button>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {tab === 'info' && (
                        <form id="clientForm" onSubmit={onSave} className="space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nom</label><input name="name" defaultValue={client?.name} required className="w-full p-2 border rounded" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label><input name="email" defaultValue={client?.email} className="w-full p-2 border rounded" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Téléphone</label><input name="phone" defaultValue={client?.phone} className="w-full p-2 border rounded" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Encours (€)</label><input name="aum" type="number" defaultValue={client?.aum} className="w-full p-2 border rounded" /></div>
                                <div><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Statut</label><select name="status" defaultValue={client?.status || 'Prospect'} className="w-full p-2 border rounded"><option>Prospect</option><option>Actif</option><option>Ancien</option></select></div>
                             </div>
                        </form>
                    )}
                    {tab === 'ged' && (
                        <div className="space-y-4">
                            <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-8 text-center cursor-pointer hover:bg-blue-100 transition-colors">
                                <UploadCloud size={32} className="mx-auto text-blue-500 mb-2"/><p className="text-sm font-medium text-blue-900">Déposez vos PDF ici</p>
                            </div>
                            <div className="space-y-2">
                                {files.map((f, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50">
                                        <div className="flex items-center gap-3"><FileText className="text-red-500" size={20}/><div><p className="text-sm font-medium text-slate-800">{f.name}</p><p className="text-[10px] text-slate-400">{f.date} • {f.size}</p></div></div>
                                        <div className="flex gap-2"><button className="p-1 text-slate-400 hover:text-red-600"><Trash2 size={16}/></button></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {tab === 'sign' && (
                        <div className="space-y-6">
                            <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg flex items-start gap-3"><div className="bg-white p-2 rounded-full shadow-sm"><PenTool size={20} className="text-orange-500"/></div><div><h4 className="font-bold text-orange-900 text-sm">DocuSign Actif</h4><p className="text-xs text-orange-700 mt-1">Les documents signés remonteront dans la GED.</p></div></div>
                            <Button className="w-full" variant="secondary" icon={Send}>Nouvelle demande</Button>
                        </div>
                    )}
                </div>
                <div className="p-4 border-t bg-slate-50 rounded-b-xl flex justify-end gap-2">
                    <Button variant="ghost" onClick={onClose}>Fermer</Button>
                    {tab === 'info' && <Button onClick={() => document.getElementById('clientForm').requestSubmit()} icon={CheckCircle}>Enregistrer</Button>}
                </div>
            </div>
        </div>
    );
};

const SidebarBtn = ({ id, icon: Icon, label, active, set }) => (
    <button onClick={() => set(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all mb-1 ${active === id ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
        <Icon size={20} /> <span className="font-medium text-sm">{label}</span>
    </button>
);
const Card = ({ children, className = "" }) => <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>{children}</div>;