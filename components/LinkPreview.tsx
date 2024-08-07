import { Portal, Transition } from "@headlessui/react";
import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import cx from "clsx";
import Image from "next/image";
import { encode } from "qss";
import React from "react";

export const LinkPreview = ({
  children,
  url,
  className,
}: {
  children: React.ReactNode;
  url: string;
  className?: string;
}) => {
  const width = 200;
  const height = 125;
  const quality = 50;
  const layout = "fixed";

  // Simplifies things by encoding our microlink params into a query string.
  const params = encode({
    url,
    screenshot: true,
    meta: false,
    embed: "screenshot.url",
    colorScheme: "dark",
    "viewport.isMobile": true,
    "viewport.deviceScaleFactor": 1,

    "viewport.width": width * 3,
    "viewport.height": height * 3,
  });

  const src = `https://api.microlink.io/?${params}`;

  const [isOpen, setOpen] = React.useState(false);
  // const [static, setStatic] = useState(false);

  // if (staticImage) setStatic(true);

  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <>
      {/**
       * Microlink.io + next/image can take a few seconds to fetch and generate
       * a screenshot. The delay makes <LinkPreview> pointless. As a hacky
       * solution we create a second <Image> in a Portal after the component has
       * mounted. This <Image> triggers microlink.io + next/image so that the
       * image itself is ready by the time the user hovers on a <LinkPreview>.
       * Not concerned about the performance impact because <Image>'s are cached
       * after they are generated and the images themselves are tiny (< 10kb).
       */}
      {isMounted ? (
        <Portal>
          <div className="hidden">
            <Image
              src={src}
              width={width}
              height={height}
              quality={quality}
              priority={true}
              alt="Preview Link"
            />
          </div>
        </Portal>
      ) : null}

      <HoverCardPrimitive.Root
        openDelay={50}
        onOpenChange={(open) => {
          setOpen(open);
        }}
      >
        <HoverCardPrimitive.Trigger className={className} href={url}>
          {children}
        </HoverCardPrimitive.Trigger>

        <HoverCardPrimitive.Content side="top" align="center" sideOffset={10}>
          <Transition
            show={isOpen}
            appear={true}
            enter="transform transition duration-300 origin-bottom ease-out"
            enterFrom="opacity-0 translate-y-2 scale-0"
            enterTo="opacity-100 translate-y-0 scale-100"
            className=" rounded-xl"
          >
            <a
              href={url}
              className="block p-1 bg-gradient-to-t from-slate-900 via-slate-800 to-slate-600 border border-transparent  rounded-xl hover:border-zinc-800 relative overflow-hidden"
              // Unfortunate hack to remove the weird whitespace left by
              // next/image wrapper div
              // https://github.com/vercel/next.js/issues/18915
              style={{ fontSize: 0 }}
            >
              <div className="absolute inset-0 w-full h-full z-20 bg-zinc-900 [mask-image:linear-gradient(to_bottom,transparent,transparent,white)]" />
              <Image
                src={src}
                width={width}
                height={height}
                quality={quality}
                alt="Preview Link"
                priority={true}
                className="rounded-lg"
              />
            </a>
          </Transition>
        </HoverCardPrimitive.Content>
      </HoverCardPrimitive.Root>
    </>
  );
};
