import React, { useState, useEffect } from 'react';
import { Menu, X, MessageCircle, User, Shirt, Plus, Camera, Trash2, Edit, Cloud } from 'lucide-react';
import './App.css';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCookieBanner, setShowCookieBanner] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [wardrobe, setWardrobe] = useState([]);
  const [weather] = useState({ temp: 18, condition: 'sunny', city: 'Paris' });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    style: 'casual',
    sizes: { top: 'M', bottom: 'M', shoes: '42' }
  });
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [editing, setEditing] = useState(false);
  const [tempProfile, setTempProfile] = useState({
    name: '',
    style: 'casual',
    sizes: { top: 'M', bottom: 'M', shoes: '42' }
  });
  const [messages, setMessages] = useState([
    { sender: 'anna', text: "Bonjour ! Je suis Anna, votre styliste personnelle. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '', category: 'haut', color: '', brand: '', season: 'toutes', image: null
  });
  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);

  // Charger les données au démarrage
  useEffect(() => {
    const savedWardrobe = localStorage.getItem('gqoka_wardrobe');
    const savedProfile = localStorage.getItem('gqoka_profile');
    const savedAuth = localStorage.getItem('gqoka_auth');
    const cookieConsent = localStorage.getItem('gqoka_cookie_consent');
    
    if (!cookieConsent) {
      setShowCookieBanner(true);
    }
    
    if (savedWardrobe) {
      try {
        setWardrobe(JSON.parse(savedWardrobe));
      } catch (e) {
        console.error('Error loading wardrobe:', e);
      }
    }
    
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        setTempProfile(profile);
      } catch (e) {
        console.error('Error loading profile:', e);
      }
    }
    
    if (savedAuth) {
      try {
        const auth = JSON.parse(savedAuth);
        setIsLoggedIn(true);
        setUserProfile(prev => ({...prev, name: auth.name, email: auth.email}));
      } catch (e) {
        console.error('Error loading auth:', e);
      }
    }
  }, []);

  // Sauvegarder wardrobe
  useEffect(() => {
    localStorage.setItem('gqoka_wardrobe', JSON.stringify(wardrobe));
  }, [wardrobe]);

  // Authentification
  const handleAuth = () => {
    if (authMode === 'signup') {
      if (!authForm.name || !authForm.email || !authForm.password) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
      }
      if (authForm.password.length < 6) {
        alert('⚠️ Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      if (authForm.password !== authForm.confirmPassword) {
        alert('⚠️ Les mots de passe ne correspondent pas');
        return;
      }
      
      const authData = {
        email: authForm.email.toLowerCase().trim(),
        password: authForm.password,
        name: authForm.name.trim(),
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('gqoka_auth', JSON.stringify(authData));
      
      const profileData = {
        name: authForm.name.trim(),
        email: authForm.email.toLowerCase().trim(),
        style: 'casual',
        sizes: { top: 'M', bottom: 'M', shoes: '42' }
      };
      localStorage.setItem('gqoka_profile', JSON.stringify(profileData));
      
      setUserProfile(profileData);
      setIsLoggedIn(true);
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', confirmPassword: '', name: '' });
      alert('✅ Compte créé avec succès ! Bienvenue sur GQOKA, ' + authForm.name + ' !');
    } else {
      const savedAuth = localStorage.getItem('gqoka_auth');
      if (!savedAuth) {
        alert('❌ Aucun compte trouvé. Veuillez créer un compte.');
        setAuthMode('signup');
        return;
      }
      
      const auth = JSON.parse(savedAuth);
      if (auth.email === authForm.email.toLowerCase().trim() && auth.password === authForm.password) {
        setIsLoggedIn(true);
        setShowAuthModal(false);
        
        const savedProfile = localStorage.getItem('gqoka_profile');
        if (savedProfile) {
          const profile = JSON.parse(savedProfile);
          setUserProfile(profile);
        }
        
        setAuthForm({ email: '', password: '', confirmPassword: '', name: '' });
        alert('✅ Bienvenue ' + auth.name + ' !');
      } else {
        alert('❌ Email ou mot de passe incorrect');
      }
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('home');
    alert('✅ Vous êtes déconnecté. À bientôt !');
  };

  // Wardrobe functions
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewItem({ ...newItem, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: { ideal: 'environment' },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        } 
      });
      setStream(mediaStream);
      setShowCamera(true);
      setTimeout(() => {
        const video = document.getElementById('camera-preview');
        if (video) {
          video.srcObject = mediaStream;
          video.play();
        }
      }, 100);
    } catch (err) {
      console.error('Camera error:', err);
      alert("Impossible d'accéder à la caméra.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    const video = document.getElementById('camera-preview');
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1920;
    canvas.height = video.videoHeight || 1080;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setNewItem({ ...newItem, image: imageData });
    stopCamera();
  };

  const addItem = () => {
    if (newItem.name && newItem.image) {
      const item = { 
        ...newItem, 
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      const updatedWardrobe = [...wardrobe, item];
      setWardrobe(updatedWardrobe);
      setNewItem({ name: '', category: 'haut', color: '', brand: '', season: 'toutes', image: null });
      setShowAddModal(false);
      alert('✅ Vêtement ajouté avec succès !');
    } else {
      alert('⚠️ Veuillez ajouter une photo et un nom');
    }
  };

  const filteredWardrobe = filter === 'all' ? wardrobe : wardrobe.filter(item => item.category === filter);

  // Chat
  const handleSendMessage = () => {
    if (inputMessage.trim()) {
      setMessages([...messages, { sender: 'user', text: inputMessage }]);
      setTimeout(() => {
        const responses = [
          "J'adore votre style ! Laissez-moi vous proposer quelques tenues.",
          "Parfait ! Ajoutons quelques pièces à votre dressing.",
          "Je peux vous aider à créer des looks uniques.",
          "Nous avons de belles possibilités avec vos vêtements !"
        ];
        setMessages(prev => [...prev, { 
          sender: 'anna', 
          text: responses[Math.floor(Math.random() * responses.length)] 
        }]);
      }, 1000);
      setInputMessage('');
    }
  };

  // Cookies
  const acceptCookies = () => {
    localStorage.setItem('gqoka_cookie_consent', JSON.stringify({
      accepted: true,
      date: new Date().toISOString()
    }));
    setShowCookieBanner(false);
  };

  const refuseCookies = () => {
    localStorage.setItem('gqoka_cookie_consent', JSON.stringify({
      accepted: false,
      date: new Date().toISOString()
    }));
    setShowCookieBanner(false);
  };

  // Profil
  const saveProfile = () => {
    setUserProfile(tempProfile);
    localStorage.setItem('gqoka_profile', JSON.stringify(tempProfile));
    setEditing(false);
  };

  const deleteAccount = () => {
    if (window.confirm('⚠️ ATTENTION : Cette action est irréversible. Voulez-vous vraiment supprimer votre compte et toutes vos données ?')) {
      localStorage.removeItem('gqoka_auth');
      localStorage.removeItem('gqoka_profile');
      localStorage.removeItem('gqoka_wardrobe');
      alert('✅ Votre compte et toutes vos données ont été supprimés.');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* HEADER */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden">
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="hidden lg:flex space-x-8 text-sm tracking-wider">
              <button onClick={() => setCurrentPage('home')} className="hover:text-gray-300">ACCUEIL</button>
              <button onClick={() => setCurrentPage('wardrobe')} className="hover:text-gray-300">MON DRESSING</button>
              <button onClick={() => setCurrentPage('recommendations')} className="hover:text-gray-300">STYLE</button>
              <button onClick={() => setCurrentPage('profile')} className="hover:text-gray-300">PROFIL</button>
              <button onClick={() => setCurrentPage('cookies')} className="hover:text-gray-300">COOKIES/RGPD</button>
            </div>
          </div>
          <button onClick={() => setCurrentPage('home')} className="absolute left-1/2 transform -translate-x-1/2">
            <h1 className="text-2xl font-light tracking-[0.3em]">GQOKA</h1>
          </button>
          <div className="flex items-center space-x-4">
            {/* ICÔNE PROFIL FLATICONE */}
            <button 
              onClick={() => isLoggedIn ? setCurrentPage('profile') : setShowAuthModal(true)} 
              className="hover:text-gray-300 flex items-center space-x-2 w-10 h-10 rounded-full hover:bg-white/10 justify-center transition"
              title={isLoggedIn ? "Mon profil" : "Se connecter"}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="8" r="4" />
                <path d="M12 14c-4 0-6 2-6 5v2h12v-2c0-3-2-5-6-5z" />
              </svg>
            </button>
            {isLoggedIn && (
              <button onClick={handleLogout} className="text-sm hover:text-gray-300 hidden lg:inline">
                Déconnexion
              </button>
            )}
          </div>
        </div>
        {menuOpen && (
          <div className="lg:hidden bg-black border-t border-white/10 px-6 py-4 space-y-4">
            <button onClick={() => { setCurrentPage('home'); setMenuOpen(false); }} className="block w-full text-left">ACCUEIL</button>
            <button onClick={() => { setCurrentPage('wardrobe'); setMenuOpen(false); }} className="block w-full text-left">MON DRESSING</button>
            <button onClick={() => { setCurrentPage('recommendations'); setMenuOpen(false); }} className="block w-full text-left">STYLE</button>
            <button onClick={() => { setCurrentPage('profile'); setMenuOpen(false); }} className="block w-full text-left">PROFIL</button>
            <button onClick={() => { setCurrentPage('cookies'); setMenuOpen(false); }} className="block w-full text-left">COOKIES/RGPD</button>
          </div>
        )}
      </nav>

      {/* HOME PAGE */}
      {currentPage === 'home' && (
        <div className="min-h-screen">
          <section className="relative" style={{ minHeight: '100vh', height: '100dvh' }}>
            <div className="absolute inset-0 overflow-hidden">
              <img 
                src="/hero-image.jpg" 
                alt="GQOKA Fashion" 
                className="w-full h-full"
                style={{ 
                  objectFit: window.innerWidth < 768 ? 'contain' : 'cover',
                  objectPosition: window.innerWidth < 768 ? 'center center' : 'center top',
                  backgroundColor: '#000'
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80"></div>
            </div>
            
            <div className="absolute bottom-20 md:bottom-4 left-1/2 transform -translate-x-1/2 z-10 text-center w-full px-4">
              <p className="text-sm md:text-lg tracking-[0.2em] md:tracking-[0.25em] font-light mb-4 text-white">
                Ton style, ton histoire
              </p>
              <button 
                onClick={() => setCurrentPage('wardrobe')}
                className="bg-white/10 backdrop-blur-sm text-white border border-white/30 px-8 md:px-10 py-3 text-xs md:text-sm tracking-[0.2em] font-light hover:bg-white/20 transition-all duration-300"
              >
                DÉCOUVRIR
              </button>
            </div>
          </section>

          <section className="py-24 px-6 max-w-4xl mx-auto text-center">
            <h3 className="text-3xl font-light tracking-[0.2em] mb-8">L'INTELLIGENCE AU SERVICE DE VOTRE STYLE</h3>
            <p className="text-lg font-light leading-relaxed text-gray-300 mb-12">
              GQOKA réinvente votre relation avec votre garde-robe.
            </p>

            {/* WEATHER WIDGET */}
            <div className="mb-16 weather-widget">
              <div className="weather-current">
                <div className="weather-icon">
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                    <circle cx="32" cy="32" r="20" fill="#FFD700" />
                    <circle cx="32" cy="10" r="3" fill="#FFD700" />
                    <circle cx="54" cy="32" r="3" fill="#FFD700" />
                    <circle cx="32" cy="54" r="3" fill="#FFD700" />
                    <circle cx="10" cy="32" r="3" fill="#FFD700" />
                  </svg>
                </div>
                <div className="weather-info">
                  <p className="temp">{Math.round(weather.temp)}°C</p>
                  <p className="condition">{weather.condition}</p>
                  <p className="city">{weather.city}</p>
                </div>
              </div>
              <div className="outfit-suggestion">
                <h3>👗 Tenue Suggérée</h3>
                <div className="suggestion-items">
                  <span className="item-tag">T-shirt</span>
                  <span className="item-tag">Short</span>
                  <span className="item-tag">Lunettes</span>
                </div>
                <div className="suggestion-colors">
                  <span>Couleurs :</span>
                  <span className="color-swatch" style={{ backgroundColor: '#FFFFFF' }} title="Blanc" />
                  <span className="color-swatch" style={{ backgroundColor: '#87CEEB' }} title="Bleu" />
                  <span className="color-swatch" style={{ backgroundColor: '#FFD700' }} title="Jaune" />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-12 mt-16">
              <button onClick={() => setCurrentPage('wardrobe')} className="hover:scale-105 transition-transform">
                <Shirt size={40} className="mx-auto mb-4 opacity-80" />
                <h4 className="text-lg tracking-wider mb-3">GARDE-ROBE DIGITALE</h4>
              </button>
              <button onClick={() => setCurrentPage('recommendations')} className="hover:scale-105 transition-transform">
                <MessageCircle size={40} className="mx-auto mb-4 opacity-80" />
                <h4 className="text-lg tracking-wider mb-3">CONSEILS PERSONNALISÉS</h4>
              </button>
              <button onClick={() => setCurrentPage('certificate')} className="hover:scale-105 transition-transform">
                <Cloud size={40} className="mx-auto mb-4 opacity-80" />
                <h4 className="text-lg tracking-wider mb-3">CERTIFICATION GQOKA</h4>
              </button>
            </div>
          </section>
        </div>
      )}

      {/* WARDROBE PAGE */}
      {currentPage === 'wardrobe' && (
        <div className="min-h-screen pt-24 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-4xl font-light tracking-[0.2em] mb-2">MON DRESSING</h2>
                <p className="text-gray-400">{wardrobe.length} pièces</p>
              </div>
              <button onClick={() => setShowAddModal(true)} className="bg-white text-black px-6 py-3 rounded flex items-center space-x-2">
                <Plus size={20} />
                <span>AJOUTER</span>
              </button>
            </div>

            <div className="flex space-x-4 mb-8 overflow-x-auto">
              {['all', 'haut', 'bas', 'chaussures', 'accessoires', 'veste'].map(cat => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`px-6 py-2 rounded-full text-sm ${filter === cat ? 'bg-white text-black' : 'bg-white/10'}`}
                >
                  {cat === 'all' ? 'TOUT' : cat.toUpperCase()}
                </button>
              ))}
            </div>

            {wardrobe.length === 0 ? (
              <div className="text-center py-24">
                <Shirt size={64} className="mx-auto mb-6 opacity-30" />
                <h3 className="text-2xl font-light mb-4">Votre dressing est vide</h3>
                <button onClick={() => setShowAddModal(true)} className="bg-white text-black px-8 py-3 rounded">
                  AJOUTER UN VÊTEMENT
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {filteredWardrobe.map(item => (
                  <div key={item.id} className="bg-white/5 rounded-lg overflow-hidden border border-white/10 group">
                    <div className="aspect-square bg-white/10 relative">
                      {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                      <button 
                        onClick={() => setWardrobe(wardrobe.filter(i => i.id !== item.id))}
                        className="absolute top-2 right-2 bg-red-500 p-2 rounded opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="p-4">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-gray-400">{item.brand || 'Sans marque'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ADD MODAL */}
            {showAddModal && (
              <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-zinc-900 rounded-lg max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-light tracking-wider">AJOUTER UN VÊTEMENT</h3>
                    <button onClick={() => setShowAddModal(false)}><X size={24} /></button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
                        {showCamera ? (
                          <div className="space-y-4">
                            <video 
                              id="camera-preview" 
                              autoPlay 
                              playsInline
                              className="w-full rounded"
                            ></video>
                            <div className="flex space-x-4">
                              <button 
                                onClick={capturePhoto}
                                className="flex-1 bg-white text-black py-2 rounded"
                              >
                                CAPTURER
                              </button>
                              <button 
                                onClick={stopCamera}
                                className="flex-1 bg-red-500 text-white py-2 rounded"
                              >
                                ANNULER
                              </button>
                            </div>
                          </div>
                        ) : newItem.image ? (
                          <div>
                            <img src={newItem.image} alt="Preview" className="max-h-48 mx-auto rounded mb-4" />
                            <button 
                              onClick={() => setNewItem({...newItem, image: null})}
                              className="text-sm text-gray-400 hover:text-white"
                            >
                              Changer l'image
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <Camera size={48} className="mx-auto opacity-50" />
                            <p className="text-gray-400 mb-4">Ajouter une photo</p>
                            <div className="flex flex-col space-y-2">
                              <button
                                onClick={startCamera}
                                className="bg-white/10 text-white py-3 px-4 rounded hover:bg-white/20 flex items-center justify-center space-x-2"
                              >
                                <Camera size={20} />
                                <span>PRENDRE UNE PHOTO</span>
                              </button>
                              <input 
                                type="file" 
                                accept="image/*"
                                capture="environment"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="imageUpload"
                              />
                              <label 
                                htmlFor="imageUpload" 
                                className="cursor-pointer bg-white/10 text-white py-3 px-4 rounded hover:bg-white/20 flex items-center justify-center space-x-2"
                              >
                                <Plus size={20} />
                                <span>CHOISIR DEPUIS LA GALERIE</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <input 
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      placeholder="Nom du vêtement"
                      className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white"
                    />
                    <select 
                      value={newItem.category}
                      onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white"
                    >
                      <option value="haut">Haut</option>
                      <option value="bas">Bas</option>
                      <option value="chaussures">Chaussures</option>
                      <option value="veste">Veste</option>
                      <option value="accessoires">Accessoires</option>
                    </select>
                    <div className="flex space-x-4">
                      <button onClick={() => setShowAddModal(false)} className="flex-1 bg-white/5 py-3 rounded">ANNULER</button>
                      <button onClick={addItem} disabled={!newItem.name || !newItem.image} className="flex-1 bg-white text-black py-3 rounded disabled:opacity-50">
                        AJOUTER
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* RECOMMENDATIONS PAGE */}
      {currentPage === 'recommendations' && (
        <div className="min-h-screen pt-24 px-6 pb-12">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-light tracking-[0.2em] mb-12 text-center">RECOMMANDATIONS DU JOUR</h2>
            <div className="bg-white/5 rounded-lg p-6 mb-12 flex items-center justify-between border border-white/10">
              <div className="flex items-center space-x-4">
                <Cloud size={32} />
                <div>
                  <h3 className="text-2xl font-light">{weather.temp}°C</h3>
                  <p className="text-gray-400">{weather.city}</p>
                </div>
              </div>
            </div>
            {wardrobe.length === 0 ? (
              <div className="text-center py-24">
                <Shirt size={64} className="mx-auto mb-6 opacity-30" />
                <h3 className="text-2xl font-light mb-4">Ajoutez des vêtements</h3>
                <button onClick={() => setCurrentPage('wardrobe')} className="bg-white text-black px-8 py-3 rounded">
                  ALLER AU DRESSING
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-8 border border-white/10">
                <h3 className="text-2xl font-light mb-6 text-center">TENUE SUGGÉRÉE</h3>
                <p className="text-center text-gray-300">Consultez votre garde-robe pour découvrir les recommandations de tenues.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CERTIFICATE PAGE */}
      {currentPage === 'certificate' && (
        <div className="min-h-screen pt-24 pb-12">
          <div className="certificate-container">
            <div className="certificate">
              <div className="certificate-border">
                <div className="certificate-header">
                  <h1>GQOKA</h1>
                  <p className="subtitle">Ton Style, Ton Histoire</p>
                </div>

                <div className="certificate-body">
                  <p className="label">Certifie par présent que</p>
                  <h2 className="name">{isLoggedIn ? userProfile.name : 'GQOKA User'}</h2>
                  <p className="label">possède une garde-robe unique et stylée</p>

                  <div className="stats">
                    <div className="stat">
                      <span className="number">{wardrobe.length}</span>
                      <span className="label">Articles Curatés</span>
                    </div>
                    <div className="stat">
                      <span className="number">{Math.floor(wardrobe.length * 0.4)}</span>
                      <span className="label">Outfits Créés</span>
                    </div>
                  </div>

                  <p className="date">Émise le {new Date().toLocaleDateString('fr-FR')}</p>

                  <div className="seal">
                    <div className="seal-circle">
                      <span>✓</span>
                    </div>
                  </div>
                </div>

                <p className="footer">www.gqoka.com - Plateforme Fashion Tech Européenne</p>
              </div>
            </div>

            <button className="btn-print" onClick={() => window.print()}>
              🖨️ Imprimer mon certificat
            </button>
          </div>
        </div>
      )}

      {/* COOKIES PAGE */}
      {currentPage === 'cookies' && (
        <div className="cookies-page">
          <div className="cookies-container">
            <h1>🍪 Politique de Cookies & RGPD</h1>
            
            <section className="cookies-section">
              <h2>Qu'est-ce que les cookies ?</h2>
              <p>Les cookies sont de petits fichiers texte stockés sur votre appareil lorsque vous visitez un site web. Ils permettent aux sites de se souvenir de vos préférences et activités.</p>
            </section>

            <section className="cookies-section">
              <h2>🔍 Cookies utilisés par GQOKA</h2>
              <div className="cookie-list">
                <div className="cookie-item">
                  <h3>📱 Cookies de Session</h3>
                  <p><strong>Durée :</strong> Pendant votre visite</p>
                  <p><strong>Usage :</strong> Vos données de connexion et votre compte utilisateur</p>
                  <p><strong>Obligatoire :</strong> ✅ Oui (pour que le site fonctionne)</p>
                </div>

                <div className="cookie-item">
                  <h3>⚙️ Cookies de Préférence</h3>
                  <p><strong>Durée :</strong> 1 an</p>
                  <p><strong>Usage :</strong> Vos paramètres (langue, thème, préférences de style)</p>
                  <p><strong>Obligatoire :</strong> ❌ Non (vous pouvez les refuser)</p>
                </div>
              </div>
            </section>

            <section className="cookies-section">
              <h2>📋 Vos droits RGPD</h2>
              <p>Conformément au RGPD, vous avez les droits suivants :</p>
              <ul className="rights-list">
                <li><strong>✓ Droit d'accès :</strong> Vous pouvez demander l'accès à toutes vos données personnelles</li>
                <li><strong>✓ Droit de rectification :</strong> Vous pouvez corriger ou mettre à jour vos données</li>
                <li><strong>✓ Droit à l'oubli :</strong> Vous pouvez demander la suppression de vos données</li>
                <li><strong>✓ Droit à la portabilité :</strong> Vous pouvez récupérer vos données dans un format standard</li>
              </ul>
            </section>

            <section className="cookies-section">
              <h2>📧 Comment exercer vos droits ?</h2>
              <div className="contact-info">
                <p><strong>Email :</strong> <a href="mailto:privacy@gqoka.com">privacy@gqoka.com</a></p>
                <p><strong>Adresse :</strong> GQOKA, Paris, France</p>
                <p><strong>Délai de réponse :</strong> 30 jours (conformément au RGPD)</p>
              </div>
            </section>

            <section className="cookies-section">
              <h2>📅 Dernière mise à jour</h2>
              <p><strong>Date :</strong> Novembre 2025</p>
            </section>
          </div>
        </div>
      )}

      {/* PROFILE PAGE */}
      {currentPage === 'profile' && (
        <div className="min-h-screen pt-24 px-6 pb-12">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-12">
              <h2 className="text-4xl font-light tracking-[0.2em]">MON PROFIL</h2>
              {!editing && isLoggedIn && (
                <button onClick={() => setEditing(true)} className="flex items-center space-x-2 bg-white/10 px-6 py-3 rounded">
                  <Edit size={18} />
                  <span>MODIFIER</span>
                </button>
              )}
            </div>
            <div className="space-y-6">
              <div className="bg-white/5 rounded-lg p-8 border border-white/10">
                <h3 className="text-xl font-light mb-6">INFORMATIONS</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm mb-2 text-gray-400">NOM</label>
                    {editing ? (
                      <input 
                        type="text"
                        value={tempProfile.name}
                        onChange={(e) => setTempProfile({...tempProfile, name: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white"
                      />
                    ) : (
                      <p className="text-lg">{userProfile.name || 'Non renseigné'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm mb-2 text-gray-400">STYLE</label>
                    {editing ? (
                      <select 
                        value={tempProfile.style}
                        onChange={(e) => setTempProfile({...tempProfile, style: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white"
                      >
                        <option value="casual">Casual</option>
                        <option value="elegant">Élégant</option>
                        <option value="sportif">Sportif</option>
                      </select>
                    ) : (
                      <p className="text-lg capitalize">{userProfile.style}</p>
                    )}
                  </div>
                </div>
              </div>
              {editing && (
                <div className="flex space-x-4">
                  <button onClick={() => { setTempProfile(userProfile); setEditing(false); }} className="flex-1 bg-white/5 py-3 rounded">
                    ANNULER
                  </button>
                  <button onClick={saveProfile} className="flex-1 bg-white text-black py-3 rounded">
                    ENREGISTRER
                  </button>
                </div>
              )}
              <div className="bg-white/5 rounded-lg p-8 border border-white/10">
                <h3 className="text-xl font-light mb-4">STATISTIQUES</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-3xl font-light">{wardrobe.length}</p>
                    <p className="text-sm text-gray-400">Pièces</p>
                  </div>
                  <div>
                    <p className="text-3xl font-light">{wardrobe.filter(item => item.category === 'haut').length}</p>
                    <p className="text-sm text-gray-400">Hauts</p>
                  </div>
                </div>
              </div>

              {isLoggedIn && (
                <div className="bg-red-900/20 rounded-lg p-6 border border-red-500/30 mt-6">
                  <h3 className="text-xl font-light mb-4 text-red-400">ZONE DANGEREUSE</h3>
                  <p className="text-sm text-gray-400 mb-4">
                    La suppression de votre compte est définitive. Toutes vos données seront perdues.
                  </p>
                  <button
                    onClick={deleteAccount}
                    className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded transition flex items-center space-x-2"
                  >
                    <Trash2 size={18} />
                    <span>SUPPRIMER MON COMPTE</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ANNA CHATBOT */}
      {chatOpen && (
        <div className="fixed bottom-0 right-0 md:bottom-8 md:right-8 w-full md:w-96 h-[600px] bg-white text-black shadow-2xl z-50 flex flex-col rounded-t-lg md:rounded-lg overflow-hidden">
          <div className="bg-black text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <MessageCircle size={20} />
              </div>
              <div>
                <h4 className="font-medium tracking-wide">ANNA</h4>
                <p className="text-xs opacity-70">Styliste virtuelle</p>
              </div>
            </div>
            <button onClick={() => setChatOpen(false)} className="hover:bg-white/10 p-2 rounded">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-black text-white' : 'bg-white border'}`}>
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t bg-white">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Écrivez votre message..."
                className="flex-1 px-4 py-2 border rounded focus:outline-none focus:border-black text-black"
              />
              <button onClick={handleSendMessage} className="bg-black text-white px-6 py-2 rounded">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-gray-800 z-40"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 rounded-lg max-w-md w-full p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-light tracking-wider">
                {authMode === 'login' ? 'CONNEXION' : 'CRÉER UN COMPTE'}
              </h3>
              <button onClick={() => setShowAuthModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm mb-2 text-gray-400">NOM</label>
                  <input
                    type="text"
                    value={authForm.name}
                    onChange={(e) => setAuthForm({...authForm, name: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-white/30"
                    placeholder="Votre nom"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm mb-2 text-gray-400">EMAIL</label>
                <input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-white/30"
                  placeholder="votre@email.com"
                />
              </div>

              <div>
                <label className="block text-sm mb-2 text-gray-400">MOT DE PASSE</label>
                <input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-white/30"
                  placeholder="••••••••"
                />
              </div>

              {authMode === 'signup' && (
                <div>
                  <label className="block text-sm mb-2 text-gray-400">CONFIRMER LE MOT DE PASSE</label>
                  <input
                    type="password"
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded px-4 py-3 text-white focus:outline-none focus:border-white/30"
                    placeholder="••••••••"
                  />
                </div>
              )}

              <button
                onClick={handleAuth}
                className="w-full bg-white text-black py-3 rounded hover:bg-gray-200 transition mt-6"
              >
                {authMode === 'login' ? 'SE CONNECTER' : 'CRÉER MON COMPTE'}
              </button>

              <div className="text-center mt-4">
                <button
                  onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-gray-400 hover:text-white transition"
                >
                  {authMode === 'login' 
                    ? "Pas encore de compte ? S'inscrire" 
                    : 'Déjà un compte ? Se connecter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* COOKIES BANNER */}
      {showCookieBanner && (
        <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/20 p-6 z-50 shadow-2xl">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-medium mb-2">🍪 Gestion des cookies</h3>
              <p className="text-sm text-gray-300">
                Nous utilisons des cookies essentiels pour le fonctionnement du site (authentification, sauvegarde de votre dressing). 
                En continuant, vous acceptez notre politique de confidentialité.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap justify-center">
              <button
                onClick={refuseCookies}
                className="px-6 py-2 bg-white/10 border border-white/30 rounded hover:bg-white/20 transition text-sm"
              >
                Refuser
              </button>
              <button
                onClick={acceptCookies}
                className="px-6 py-2 bg-white text-black rounded hover:bg-gray-200 transition text-sm font-medium"
              >
                Accepter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      {currentPage !== 'home' && (
        <footer className="border-t border-white/10 py-12 px-6 bg-black">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl font-light tracking-[0.3em] mb-6">GQOKA</h2>
            <div className="flex justify-center space-x-6 text-sm mb-4">
              <button onClick={() => setCurrentPage('cookies')} className="hover:text-gray-300 transition underline">
                Confidentialité & Cookies
              </button>
              <button onClick={() => setChatOpen(true)} className="hover:text-gray-300 transition underline">
                Contact
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-8">© 2025 GQOKA. Tous droits réservés.</p>
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;