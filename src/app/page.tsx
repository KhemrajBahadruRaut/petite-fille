import GiftCard from "@/components/giftCard/GiftCard";
import InstagramFeed from "@/components/instagram/InstagramFeed";
import MainPage from "@/components/mainpage/MainPage";
import Welcome from "@/components/welcomePage/welcome";
import WhatWeOffer from "@/components/whatWeOffer/WhatWeOffer";
import "./globals.css";

async function fetchInstagramPosts() {
  const token = process.env.INSTAGRAM_TOKEN;
  const res = await fetch(
    `https://graph.instagram.com/me/media?fields=id,caption,media_url,permalink&access_token=${token}`
  );

  let posts = [];
  if (res.ok) {
    const data = await res.json();
    posts = data.data ?? [];
  }

  return posts; // Make sure to return the array
}

export default async function Home() {
  const posts = await fetchInstagramPosts();

  return (
    <div>
      <MainPage />
      <Welcome />
      <WhatWeOffer />
      <GiftCard />
      <InstagramFeed posts={posts} />
    </div>
  );
}

