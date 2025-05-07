import clsx from "clsx";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { AiFillRightCircle } from "react-icons/ai";
import { Contact } from "./Contact";
import { Footer } from "./Footer";

import Navbar from "./Navbar/Navbar";

export const Container = (props: any) => {
  const { children, className, ...customMeta } = props;
  const router = useRouter();

  const title = "2omain 3030E | Portfolio";
  const meta = {
    title,
    description: `Welcome on my portfolio!`,
    type: "website",
    image:
      "https://pbs.twimg.com/profile_images/1233781055758512130/tpvF4g55_400x400.jpg",
    ...customMeta,
  };

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="robots" content="follow, index" />
        <meta content={meta.description} name="description" />
        <meta
          property="og:url"
          content={`https://www.romainboboe.com${router.asPath}`}
        />
        <link
          rel="canonical"
          href={`https://www.romainboboe.com${router.asPath}`}
        />
        <meta property="og:type" content={meta.type} />
        <meta property="og:site_name" content="Romain BOBOE" />
        <meta property="og:description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:image" content={meta.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@romainbey" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <meta name="twitter:image" content={meta.image} />
      </Head>

      <main className={clsx("min-h-screen antialiased bg-zinc-900", className)}>
        <div className="bg-zinc-800 flex py-2">
          <div className="mx-auto flex">
            <span className="sm:hidden md:inline">
              I'm building this very fun website booster:&nbsp;
            </span>{" "}
            <a
              href="https://www.nownownow.io/"
              target="__blank"
              className="text-zinc-300 flex flex-row space-x-1 items-center text-sm"
            >
              <span className="sm:hidden md:inline"> Check it out!!</span>
              <span className="hidden sm-inline md:hidden">
                Check this out!!
              </span>
              <AiFillRightCircle className="inline-block" />
            </a>
          </div>
        </div>
        <Navbar />
        {children}
        <Footer />
        <Contact />
      </main>
    </>
  );
};
