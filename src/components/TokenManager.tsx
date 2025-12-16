import { useState, useEffect } from 'react';
import { Key, Shield, RefreshCw, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { tokenManager } from '../utils/tokenManager';

export function TokenManager() {
  const [accessToken, setAccessToken] = useState('');
  const [refreshToken, setRefreshToken] = useState('');
  const [expiresIn, setExpiresIn] = useState(3600);
  const [showTokens, setShowTokens] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    checkTokenStatus();
  }, []);

  const checkTokenStatus = () => {
    const hasTokens = tokenManager.hasTokens();
    const currentToken = tokenManager.getAccessToken();
    
    if (hasTokens && currentToken) {
      setStatus('Valid tokens available');
    } else if (hasTokens && !currentToken) {
      setStatus('Tokens expired - refresh needed');
    } else {
      setStatus('No tokens configured');
    }
  };

  const handleSaveTokens = () => {
    if (!accessToken.trim() || !refreshToken.trim()) {
      setError('Both access token and refresh token are required');
      return;
    }

    try {
      tokenManager.setTokens(accessToken.trim(), refreshToken.trim(), expiresIn);
      setStatus('Tokens saved successfully');
      setError('');
      setAccessToken('');
      setRefreshToken('');
    } catch (err) {
      setError('Failed to save tokens');
    }
  };

  const handleRefreshToken = async () => {
    setIsRefreshing(true);
    setError('');
    
    try {
      const newToken = await tokenManager.refreshAccessToken();
      if (newToken) {
        setStatus('Token refreshed successfully');
      } else {
        setError('Failed to refresh token - please enter new tokens');
      }
    } catch (err) {
      setError('Token refresh failed');
    } finally {
      setIsRefreshing(false);
      checkTokenStatus();
    }
  };

  const handleClearTokens = () => {
    tokenManager.clearTokens();
    setStatus('Tokens cleared');
    setError('');
    checkTokenStatus();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-4 flex items-center gap-3">
          <Shield className="w-10 h-10 text-blue-400" />
          Token Management
        </h1>
        <p className="text-gray-400 text-lg">
          Manage API access and refresh tokens for secure authentication.
        </p>
      </div>

      {/* Token Status */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Key className="w-5 h-5 text-green-400" />
            Token Status
          </h3>
          <button
            onClick={checkTokenStatus}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            Check Status
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {tokenManager.hasTokens() ? (
            <CheckCircle2 className="w-5 h-5 text-green-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          )}
          <span className="text-gray-300">{status}</span>
        </div>

        {tokenManager.hasTokens() && (
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleRefreshToken}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white rounded-lg text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
            </button>
            <button
              onClick={handleClearTokens}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
            >
              Clear Tokens
            </button>
          </div>
        )}
      </div>

      {/* Token Input */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Configure Tokens</h3>
          <button
            onClick={() => setShowTokens(!showTokens)}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm"
          >
            {showTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showTokens ? 'Hide' : 'Show'} Tokens
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Access Token *
            </label>
            <input
              type={showTokens ? 'text' : 'password'}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              placeholder="Enter access token"
              className="w-full bg-gray-900/50 border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Refresh Token *
            </label>
            <input
              type={showTokens ? 'text' : 'password'}
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              placeholder="Enter refresh token"
              className="w-full bg-gray-900/50 border border-white/20 rounded-lg px-4 py-3 text-white font-mono text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Expires In (seconds)
            </label>
            <input
              type="number"
              value={expiresIn}
              onChange={(e) => setExpiresIn(parseInt(e.target.value) || 3600)}
              className="w-full bg-gray-900/50 border border-white/20 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleSaveTokens}
            className="w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium"
          >
            Save Tokens
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}