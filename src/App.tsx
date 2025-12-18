import { useState, useEffect } from 'react';
import { User, ArrowLeft, Menu, X, Settings, Keyboard } from 'lucide-react';

// Mock components for demonstration
const SimpleConverter = ({ onConvert }) => <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><p className="text-gray-700 text-center">Simple Converter Component</p></div>;
const EnhancedConverterWithDatasets = ({ onConvert }) => <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><p className="text-gray-700 text-center">Enhanced Converter Component</p></div>;
const TokenManager = () => <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><h2 className="text-2xl font-bold text-gray-800 mb-4">Token Manager</h2><p className="text-gray-700 text-center">Token Management Component</p></div>;
const BulkConverter = () => <div className="max-w-7xl mx-auto"><div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><h2 className="text-2xl font-bold text-gray-800 mb-4">Bulk Converter</h2><p className="text-gray-700 text-center">Bulk Converter Component</p></div></div>;
const ConversionHistory = () => <div className="max-w-7xl mx-auto"><div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><h2 className="text-2xl font-bold text-gray-800 mb-4">Conversion History</h2><p className="text-gray-700 text-center">Conversion History Component</p></div></div>;
const ApiDocs = () => <div className="max-w-7xl mx-auto"><div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><h2 className="text-2xl font-bold text-gray-800 mb-4">API Documentation</h2><p className="text-gray-700 text-center">API Docs Component</p></div></div>;
const DataStorage = () => <div className="max-w-7xl mx-auto"><div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><h2 className="text-2xl font-bold text-gray-800 mb-4">Data Storage</h2><p className="text-gray-700 text-center">Data Storage Component</p></div></div>;
const CloudStorage = () => <div className="max-w-7xl mx-auto"><div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><h2 className="text-2xl font-bold text-gray-800 mb-4">Cloud Storage</h2><p className="text-gray-700 text-center">Cloud Storage Component</p></div></div>;
const DatabaseExport = () => <div className="max-w-7xl mx-auto"><div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><h2 className="text-2xl font-bold text-gray-800 mb-4">Database Export</h2><p className="text-gray-700 text-center">Database Export Component</p></div></div>;
const Integrations = () => <div className="max-w-7xl mx-auto"><div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><h2 className="text-2xl font-bold text-gray-800 mb-4">Integrations</h2><p className="text-gray-700 text-center">Integrations Component</p></div></div>;
const KnowledgeBase = () => <div className="max-w-7xl mx-auto"><div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><h2 className="text-2xl font-bold text-gray-800 mb-4">Knowledge Base</h2><p className="text-gray-700 text-center">Knowledge Base Component</p></div></div>;
const AdvancedAnalytics = () => <div className="max-w-7xl mx-auto"><div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl p-8 border border-white/20"><h2 className="text-2xl font-bold text-gray-800 mb-4">Advanced Analytics</h2><p className="text-gray-700 text-center">Advanced Analytics Component</p></div></div>;
const AuthModal = ({ isOpen, onClose }) => isOpen ? <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white border border-gray-200 rounded-xl max-w-md w-full"><div className="flex items-center justify-between p-6 border-b border-gray-200"><h2 className="text-xl font-semibold text-gray-800">Sign In</h2><button onClick={onClose} className="text-gray-500 hover:text-gray-700" title="Close"><X className="w-6 h-6" /></button></div><div className="p-6"><p className="text-gray-700 text-center">Auth Modal Component</p></div></div></div> : null;
const SettingsModal = ({ isOpen, onClose }) => isOpen ? <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"><div className="bg-white border border-gray-200 rounded-xl max-w-md w-full"><div className="flex items-center justify-between p-6 border-b border-gray-200"><div className="flex items-center gap-3"><Settings className="w-6 h-6 text-blue-600" /><h2 className="text-xl font-semibold text-gray-800">Settings</h2></div><button onClick={onClose} className="text-gray-500 hover:text-gray-700" title="Close settings"><X className="w-6 h-6" /></button></div><div className="p-6"><p className="text-gray-700 text-center">Settings Component</p></div></div></div> : null;

type ViewMode = 'converter' | 'enhanced' | 'tokens' | 'history' | 'bulk' | 'api' | 'tutorial' | 'cloud' | 'database' | 'integrations' | 'knowledge' | 'analytics' | 'storage';

function App() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState<ViewMode>('converter');
  const [xmlInput, setXmlInput] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case ',':
            e.preventDefault();
            setShowSettings(true);
            break;
          case '/':
            e.preventDefault();
            setShowKeyboardShortcuts(true);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [xmlInput]);

  const handleConversionComplete = async (xmlInput: string, result: string, conversionTime: number, fileType: string, filename?: string) => {
    console.log('Conversion complete');
  };

  const handleSignOut = async () => {
    setUser(null);
    setActiveView('converter');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-green-700 to-blue-900">
      {/* Header with white background inside container */}
      <nav className="border-b border-blue-500/20 shadow-lg relative z-50">
        <div className="bg-white">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20 py-4">
              <div className="flex items-center gap-3">
                <div className="w-40 h-16 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl">
                  TRINITY
                </div>
              </div>

              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden text-blue-900 p-2"
                title="Toggle mobile menu"
              >
                {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <div className="hidden lg:flex items-center gap-6">
                <button
                  onClick={() => setActiveView('converter')}
                  className={`text-sm font-medium transition-colors ${
                    activeView === 'converter' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => setActiveView('enhanced')}
                  className={`text-sm font-medium transition-colors ${
                    activeView === 'enhanced' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Enhanced
                </button>

                <button
                  onClick={() => setActiveView('tokens')}
                  className={`text-sm font-medium transition-colors ${
                    activeView === 'tokens' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Tokens
                </button>
                <button
                  onClick={() => setActiveView('bulk')}
                  className={`text-sm font-medium transition-colors ${
                    activeView === 'bulk' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  Bulk Convert
                </button>
                <button
                  onClick={() => setActiveView('history')}
                  className={`text-sm font-medium transition-colors ${
                    activeView === 'history' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => setActiveView('api')}
                  className={`text-sm font-medium transition-colors ${
                    activeView === 'api' ? 'text-blue-600 font-semibold' : 'text-gray-600 hover:text-blue-600'
                  }`}
                >
                  API
                </button>

                <div className="relative">
                  <button 
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    More
                  </button>
                  {showMoreMenu && (
                    <div className="absolute right-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-[9999] min-w-48 max-w-xs">
                      <button
                        onClick={() => { setActiveView('storage'); setShowMoreMenu(false); }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-t-lg"
                      >
                        Data Storage
                      </button>
                      <button
                        onClick={() => { setActiveView('cloud'); setShowMoreMenu(false); }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        Cloud Storage
                      </button>
                      <button
                        onClick={() => { setActiveView('database'); setShowMoreMenu(false); }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        Database Export
                      </button>
                      <button
                        onClick={() => { setActiveView('integrations'); setShowMoreMenu(false); }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        Integrations
                      </button>
                      <button
                        onClick={() => { setActiveView('knowledge'); setShowMoreMenu(false); }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                      >
                        Knowledge Base
                      </button>
                      <button
                        onClick={() => { setActiveView('analytics'); setShowMoreMenu(false); }}
                        className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-b-lg"
                      >
                        Analytics
                      </button>
                    </div>
                  )}
                </div>

                {user ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-blue-900">{user.email}</span>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Sign out
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
                      title="Open settings"
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowAuthModal(true)}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>

            {showMobileMenu && (
              <div className="lg:hidden py-4 space-y-2">
                <button
                  onClick={() => { setActiveView('converter'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg ${
                    activeView === 'converter' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Simple Converter
                </button>
                <button
                  onClick={() => { setActiveView('enhanced'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg ${
                    activeView === 'enhanced' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Enhanced Converter
                </button>
                <button
                  onClick={() => { setActiveView('tokens'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg ${
                    activeView === 'tokens' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Token Management
                </button>
                <button
                  onClick={() => { setActiveView('bulk'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg ${
                    activeView === 'bulk' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Bulk Convert
                </button>
                <button
                  onClick={() => { setActiveView('history'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg ${
                    activeView === 'history' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  History
                </button>
                <button
                  onClick={() => { setActiveView('api'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg ${
                    activeView === 'api' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  API
                </button>
                <button
                  onClick={() => { setActiveView('storage'); setShowMobileMenu(false); }}
                  className={`block w-full text-left px-4 py-2 rounded-lg ${
                    activeView === 'storage' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                  }`}
                >
                  Data Storage
                </button>
                {!user && (
                  <button
                    onClick={() => { setShowAuthModal(true); setShowMobileMenu(false); }}
                    className="block w-full text-left px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    Get Started
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        {activeView === 'converter' && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Simple XML to JSON Converter
              </h1>
              <p className="text-gray-300 text-lg">
                Convert XML files to JSON format with specialized Alteryx workflow support.
              </p>
            </div>
            
            <SimpleConverter onConvert={handleConversionComplete} />
            
            <footer className="mt-16 pt-8 border-t border-white/10 text-center">
              <p className="text-gray-300 text-sm mb-2">
                Trinity Technology Solutions - XML to JSON Converter
              </p>
            </footer>
          </div>
        )}

        {activeView === 'enhanced' && (
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">
                Designer Desktop to Designer Cloud Converter
              </h1>
              <p className="text-gray-300 text-lg">
                Advanced XML to JSON conversion with comprehensive workflow and dataset management capabilities.
              </p>
            </div>
            
            <EnhancedConverterWithDatasets onConvert={handleConversionComplete} />
            
            <footer className="mt-16 pt-8 border-t border-white/10 text-center">
              <p className="text-gray-300 text-sm mb-2">
                Trinity Technology Solutions - Enhanced XML to JSON Converter with Dataset Management
              </p>
            </footer>
          </div>
        )}

        {activeView === 'tokens' && (
          <div className="max-w-7xl mx-auto">
            <TokenManager />
          </div>
        )}

        {activeView === 'bulk' && <BulkConverter />}
        {activeView === 'history' && <ConversionHistory />}
        {activeView === 'api' && <ApiDocs />}
        {activeView === 'storage' && <DataStorage />}
        {activeView === 'cloud' && <CloudStorage />}
        {activeView === 'database' && <DatabaseExport />}
        {activeView === 'integrations' && <Integrations />}
        {activeView === 'knowledge' && <KnowledgeBase />}
        {activeView === 'analytics' && <AdvancedAnalytics />}
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      
      {/* Keyboard Shortcuts Modal */}
      {showKeyboardShortcuts && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-xl max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Keyboard className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-800">Keyboard Shortcuts</h2>
              </div>
              <button onClick={() => setShowKeyboardShortcuts(false)} className="text-gray-500 hover:text-gray-700" title="Close shortcuts">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Convert XML</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700">Ctrl+Enter</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Open Settings</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700">Ctrl+,</kbd>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-700">Show Shortcuts</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-700">Ctrl+/</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
