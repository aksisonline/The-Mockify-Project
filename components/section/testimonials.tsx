// "use client";

// import { cn } from "@/lib/utils";
// import { Marquee } from "../ui/marquee";
// import { Container } from "../container";
// import { reviews } from "@/lib/constant";
// import { motion } from "framer-motion";
// import Image from "next/image";

// const firstRow = reviews.slice(0, reviews.length / 2);
// const secondRow = reviews.slice(reviews.length / 2);

// const ReviewCard = ({
//   img,
//   name,
//   username,
//   body,
// }: {
//   img: string;
//   name: string;
//   username: string;
//   body: string;
// }) => {
//   return (
//     <figure
//       className={cn(
//         "relative w-[280px] sm:w-[300px] h-56 sm:h-64 cursor-pointer overflow-hidden rounded-xl border border-brand/30 p-4 sm:p-6",
//         "bg-white hover:bg-grey/5 shadow-lg",
//         "hover:shadow-md transition-all duration-200 flex flex-col justify-between"
//       )}
//     >
//       <div className="flex flex-row items-center gap-2">
//         <Image 
//           className="rounded-full" 
//           width={32}
//           height={32} 
//           alt="" 
//           src={img} 
//         />
//         <div className="flex flex-col">
//           <figcaption className="text-sm font-medium text-primary">
//             {name}
//           </figcaption>
//           <p className="text-xs font-medium text-primary-text">{username}</p>
//         </div>
//       </div>
//       <blockquote className="mt-2 text-sm">{body}</blockquote>
//     </figure>
//   );
// };

// export function Testimonial() {
//   return (
//     <motion.div
//       initial={{ y: 70, opacity: 0 }}
//       whileInView={{ y: 0, opacity: 1 }}
//       viewport={{ once: true }}
//       transition={{ ease: "easeIn", delay: 0.3 }}
//       className="animate-fade-in"
//     >
//       <Container className="py-12 lg:py-16 px-4 lg:px-8">
//         <div className="mx-auto max-w-full text-center mb-8 lg:mb-10">
//           <p className="text-sm lg:text-md text-brand font-bold text-center mb-2">
//             Reviews
//           </p>
//           <h2 className="tracking-tighter text-2xl md:text-4xl lg:text-6xl font-semibold">
//             <span className="mr-2 text-brand font-serif">Trusted by</span>
//             professionals worldwide.
//           </h2>
//           <p className="mt-4 text-sm md:text-md lg:text-lg tracking-tight text-primary-text font-geist max-w-5xl mx-auto text-center px-4">
//             Join thousands of platform professionals who trust Mockify to advance their careers, 
//             connect with the community, and access the best tools and training in the industry.
//           </p>
//         </div>

//         <div className="relative flex h-[400px] sm:h-[450px] lg:h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg bg-background md:shadow-xl mask-image-custom">
//           {/* <div className="absolute inset-0 opacity-10">
//             <Image
//               src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
//               className="w-full h-full object-cover"
//               alt="  Professional Background"
//               width={500}
//               height={500}
//             />
//           </div> */}
//           <Marquee pauseOnHover className="[--duration:20s]">
//             {firstRow.map((review) => (
//               <ReviewCard key={review.name} {...review} />
//             ))}
//           </Marquee>
//           <Marquee reverse pauseOnHover className="[--duration:20s]">
//             {secondRow.map((review) => (
//               <ReviewCard key={review.name} {...review} />
//             ))}
//           </Marquee>

//           <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background"></div>
//           <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background"></div>
//         </div>
//       </Container>
//     </motion.div>
//   );
// }
