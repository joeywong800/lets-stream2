
import { useState, useEffect } from 'react';
import ContentRow from '@/components/ContentRow';
import { Media } from '@/utils/types';
import {
  getBollywoodMovies,
  getActionMovies,
  getDramaMovies,
  getNetflixContent,
  getHuluContent,
  getPrimeContent,
  getParamountContent,
  getDisneyContent,
  getHotstarContent,
  getAppleTVContent,
  getJioCinemaContent,
  getSonyLivContent
} from '@/utils/api';

const SecondaryContent = () => {
 const [bollywoodMovies, setBollywoodMovies] = useState<Media[]>([]);
  const [actionMovies, setActionMovies] = useState<Media[]>([]);
  const [dramaMovies, setDramaMovies] = useState<Media[]>([]);
  const [netflixContent, setNetflixContent] = useState<Media[]>([]);
  const [huluContent, setHuluContent] = useState<Media[]>([]);
  const [primeContent, setPrimeContent] = useState<Media[]>([]);
  const [paramountContent, setParamountContent] = useState<Media[]>([]);
  const [disneyContent, setDisneyContent] = useState<Media[]>([]);
  const [hotstarContent, setHotstarContent] = useState<Media[]>([]);
  const [appleTVContent, setAppleTVContent] = useState<Media[]>([]);
  const [jioCinemaContent, setJioCinemaContent] = useState<Media[]>([]);
  const [sonyLivContent, setSonyLivContent] = useState<Media[]>([]);

  useEffect(() => {
    const fetchGenreContent = async () => {
      try {
        // Fetch genre-based content in parallel
        const [bollywood, action, drama] = await Promise.all([
          getBollywoodMovies(),
          getActionMovies(),
          getDramaMovies()
        ]);
        
        setBollywoodMovies(bollywood);
        setActionMovies(action);
        setDramaMovies(drama);
      } catch (error) {
        console.error('Error fetching genre content:', error);
      }
    };

    const fetchPlatformContent = async () => {
      try {
        // Fetch platform-specific content in batches to improve performance
        const [netflix, hulu, prime] = await Promise.all([
          getNetflixContent(),
          getHuluContent(),
          getPrimeContent()
        ]);
        
        setNetflixContent(netflix);
        setHuluContent(hulu);
        setPrimeContent(prime);
        
        // Second batch of platform content
        const [paramount, disney, hotstar] = await Promise.all([
          getParamountContent(),
          getDisneyContent(),
          getHotstarContent()
        ]);
        
        setParamountContent(paramount);
        setDisneyContent(disney);
        setHotstarContent(hotstar);
        
        // Third batch of platform content
        const [appleTV, jioCinema, sonyLiv] = await Promise.all([
          getAppleTVContent(),
          getJioCinemaContent(),
          getSonyLivContent()
        ]);
        
        setAppleTVContent(appleTV);
        setJioCinemaContent(jioCinema);
        setSonyLivContent(sonyLiv);
      } catch (error) {
        console.error('Error fetching platform content:', error);
      }
    };

    // Execute both fetches in parallel
    fetchGenreContent();
    fetchPlatformContent();
  }, []);

  return (
    <>
      {/* Genre-based content */}
     {/*{bollywoodMovies.length > 0 && <ContentRow title="Bollywood" media={bollywoodMovies} />}
      {actionMovies.length > 0 && <ContentRow title="Action" media={actionMovies} />}
      {dramaMovies.length > 0 && <ContentRow title="Drama" media={dramaMovies} />}*/}
      
      {/* Platform-specific content */}
      {netflixContent.length > 0 && <ContentRow title="Netflix" media={netflixContent} />}
      {huluContent.length > 0 && <ContentRow title="Hulu" media={huluContent} />}
      {primeContent.length > 0 && <ContentRow title="Prime Video" media={primeContent} />}
      {paramountContent.length > 0 && <ContentRow title="Paramount+" media={paramountContent} />}
      {disneyContent.length > 0 && <ContentRow title="Disney+" media={disneyContent} />}
      {hotstarContent.length > 0 && <ContentRow title="Hotstar" media={hotstarContent} />}
      {appleTVContent.length > 0 && <ContentRow title="Apple TV+" media={appleTVContent} />}
      {jioCinemaContent.length > 0 && <ContentRow title="JioCinema" media={jioCinemaContent} />}
      {sonyLivContent.length > 0 && <ContentRow title="Sony Liv" media={sonyLivContent} />}
    </>
  );
};

export default SecondaryContent;
