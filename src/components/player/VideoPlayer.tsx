
import { motion } from 'framer-motion';
import PlyrPlayer from '@/components/PlyrPlayer';
import { useEffect, useRef, useState } from 'react';
import { registerIframeOrigin, setProxyHeaders, resetServiceWorkerData } from '@/utils/iframe-proxy-sw';
import { createProxyStreamUrl, proxyAndRewriteM3u8 } from '@/utils/cors-proxy-api';

interface VideoPlayerProps {
  isLoading: boolean;
  isCustomSource: boolean;
  streamUrl: string | null;
  iframeUrl: string;
  title: string;
  poster?: string;
  headers?: Record<string, string>;
  onLoaded: () => void;
  onError: (error: string) => void;
}

const VideoPlayer = ({
  isLoading,
  isCustomSource,
  streamUrl,
  iframeUrl,
  title,
  poster,
  headers,
  onLoaded,
  onError
}: VideoPlayerProps) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [processedStreamUrl, setProcessedStreamUrl] = useState<string | null>(null);
  const [iframeAttempts, setIframeAttempts] = useState(0);
  
  // Reset service worker data when component unmounts
  useEffect(() => {
    return () => {
      // Clean up when component unmounts to prevent issues with future player instances
      resetServiceWorkerData();
    };
  }, []);
  
  // Register iframe origin when URL changes
  useEffect(() => {
    if (!isCustomSource && iframeUrl) {
      registerIframeOrigin(iframeUrl);
      
      // Reset iframe attempts counter when URL changes
      setIframeAttempts(0);
    }
  }, [isCustomSource, iframeUrl]);

  // Process M3U8 stream URLs to handle CORS issues
  useEffect(() => {
    if (isCustomSource && streamUrl) {
      // If we have custom headers, register them with the service worker
      if (headers && Object.keys(headers).length > 0) {
        try {
          const domain = new URL(streamUrl).hostname;
          setProxyHeaders(domain, headers);
        } catch (e) {
          console.error('Failed to set proxy headers:', e);
        }
      }

      // Process based on URL type
      if (streamUrl.endsWith('.m3u8')) {
        // For M3U8 streams, we might need to rewrite URLs inside the playlist
        if (headers && Object.keys(headers).length > 0) {
          // If we have headers and it's an m3u8, we may need to rewrite the file
          proxyAndRewriteM3u8(streamUrl, headers)
            .then(processedM3u8 => {
              // Create a blob URL for the processed M3U8
              const blob = new Blob([processedM3u8], { type: 'application/vnd.apple.mpegurl' });
              const blobUrl = URL.createObjectURL(blob);
              setProcessedStreamUrl(blobUrl);
            })
            .catch(err => {
              console.error('Failed to process M3U8:', err);
              // Fallback to simple proxy
              setProcessedStreamUrl(createProxyStreamUrl(streamUrl, headers));
            });
        } else {
          // No headers, just proxy the stream
          setProcessedStreamUrl(createProxyStreamUrl(streamUrl));
        }
      } else {
        // For other types of streams, just proxy them
        setProcessedStreamUrl(createProxyStreamUrl(streamUrl, headers));
      }
    } else {
      setProcessedStreamUrl(null);
    }
  }, [isCustomSource, streamUrl, headers]);

  // Handle iframe load error
  const handleIframeError = () => {
    console.error('Iframe failed to load:', iframeUrl);
    
    // Increment attempts counter
    setIframeAttempts(prev => prev + 1);
    
    // After 3 attempts, report the error
    if (iframeAttempts >= 2) {
      onError('Failed to load iframe content after multiple attempts');
    }
  };
  
  // Handle iframe load success
  const handleIframeLoad = () => {
    console.log('Iframe loaded successfully');
    onLoaded();
    
    // Apply CSS to the iframe to prevent pointer events on overlays (helps block some popups)
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        const style = document.createElement('style');
        style.textContent = `
          div[class*="popup"], div[class*="ad"], div[id*="popup"], div[id*="ad"],
          iframe:not([src*="${new URL(iframeUrl).host}"]) {
            display: none !important;
            pointer-events: none !important;
          }
        `;
        iframeRef.current.contentDocument?.head.appendChild(style);
      } catch (e) {
        // This will likely fail due to CORS, but it's worth trying
        console.log('Could not inject CSS into iframe (expected due to CORS)');
      }
    }
  };

  return (
    <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
      {isLoading ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 flex items-center justify-center"
        >
          <div className="w-16 h-16 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
        </motion.div>
      ) : null}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full"
      >
        {isCustomSource && (processedStreamUrl || streamUrl) ? (
          <PlyrPlayer            src={processedStreamUrl || streamUrl}
            title={title}
            poster={poster}
            mediaType="movie"
            mediaId="custom"
            onLoaded={onLoaded}
            onError={onError}
          />
        ) : (          <iframe
            ref={iframeRef}
            src={iframeUrl}
            className="w-full h-full"            
            allowFullScreen
            allow="autoplay; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            key={`iframe-${iframeUrl}-${iframeAttempts}`}
         sandbox={iframeUrl.includes('vidjoy.pro') ? "allow-forms allow-pointer-lock allow-same-origin allow-scripts allow-top-navigation" : undefined}
            // Don't use sandbox as it's not supported by the video sources
            // Instead, we're using our service worker to block pop-ups
          />
        )}
      </motion.div>
    </div>
  );
};

export default VideoPlayer;
