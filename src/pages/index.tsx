import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import { GetServerSideProps } from 'next'
import { QueryClient, dehydrate } from '@tanstack/react-query'
import { GeneralEndpoints, RequestError } from '@/graph/general.endpoints'
import { usePokemonRandom, usePokemonLatestCards, usePokemonDaily } from '../hooks/usePokemons';
import Link from 'next/link'
import Header from '@/components/Header'
import { MotionContainer } from '@/components/Motion'
import HomeCarousel from '@/sections/HomeCarousel'
import { useState } from 'react'
import HomeDailyPokemon from '@/sections/HomeDailyPokemon'

const inter = Inter({ subsets: ['latin'] })

const Home = () => {
  const [date] = useState(new Date())

  const randomPokemon = usePokemonRandom();
  const latestCards = usePokemonLatestCards({ limit: 10 });
  const dailyPokemon = usePokemonDaily({ day: date.getDay(), month: date.getMonth() + 1 });

  const pokemonName = randomPokemon.data?.name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  const pokemonNameNoDash = pokemonName?.replace("-", " ");

  return (
    <>
      <Head>
        <title>Generate, Collect and Trade - Pokebot+</title>
        <meta name="description" content="Generate, Collect and Trade random Pokemon cards on your favorite Discord server." />
        <meta name="keywords" content="Generate, Collect, Trade, Pokemon, Discord, ddumst.dev, panda.dev" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <div
        className="flex w-full h-screen relative"
        style={{
          backgroundColor: randomPokemon.data?.types[0].color,
          backgroundImage: `-webkit-linear-gradient(276deg, ${randomPokemon.data?.types[0].color} 50%, #FFFFFF 80%)`
        }}
      >
        <div className="flex w-full px-8 py-36 z-10">
          <div className="flex flex-col w-1/2 h-full justify-center items-start gap-4">
            <MotionContainer
              className="text-white font-extrabold text-5xl"
              animation={'fadeRight'}
              tag='h1'
            >
              The best bot into the Pokemon World for your Discord Server
            </MotionContainer>

            <MotionContainer
              className="flex"
              animation={'fadeUp'}
            >
              <Link
                className={`text-white font-extrabold text-xl mt-4 p-4 rounded-md bg-black/40 uppercase`}
                href="https://discord.com/api/oauth2/authorize?client_id=1063588337895616622&permissions=8&scope=bot" target={"_blank"}
              >
                Install in your server
              </Link>
            </MotionContainer>



            {(randomPokemon.data?.id || 0) < 10000 && (
              <div className="absolute left-8 bottom-8 text-[10rem] font-black opacity-25">
                #{randomPokemon.data?.id}
              </div>
            )}
          </div>
          <div className="flex w-1/2 h-full justify-center items-center flex-col">
            <MotionContainer
              animation="fadeIn"
              delay={0.2}
            >
              <Image src={randomPokemon.data?.sprites[0].frontDefault || ''} alt="Pokemon Card" width={500} height={500} />
            </MotionContainer>

            <MotionContainer
              className="text-white font-extrabold text-6xl text-center"
              style={{ color: randomPokemon.data?.types[0].color }}
              animation="fadeIn"
              delay={0.2}
              tag="h1"
            >
              {pokemonNameNoDash}
            </MotionContainer>
          </div>
        </div>
      </div>

      {latestCards.data && latestCards.data.length > 0 && (
        <HomeCarousel cards={latestCards.data} />
      )}

      {dailyPokemon.data && <HomeDailyPokemon dailyPokemon={dailyPokemon.data} />}
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const queryClient = new QueryClient();
  let isError = false;

  const date = new Date();

  try {
    await queryClient.prefetchQuery(['pokemon-random'], GeneralEndpoints.getRandomPokemon);
    await queryClient.prefetchQuery(['pokemon-latest-cards'], () => GeneralEndpoints.getUserCards(10));
    await queryClient.prefetchQuery(['pokemon-daily'], () => GeneralEndpoints.getDailyPokemon(date.getDate(), date.getMonth() + 1));
  } catch (error) {
    isError = true
    context.res.statusCode = (error as RequestError).response?.status;
  }

  return {
    props: {
      isError,
      dehydratedState: dehydrate(queryClient),
    },
  }
}

export default Home;