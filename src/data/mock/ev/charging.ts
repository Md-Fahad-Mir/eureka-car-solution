import type { EvArticle } from "@/types";
import { L, REVIEWED } from "./shared";

export const charging: EvArticle = {
  slug: "charging",
  title: L("Charging an EV", "ইভি চার্জ দেওয়া"),
  summary: L(
    "Home sockets, wall boxes, public AC and DC fast chargers: how each works, how long charging really takes, connectors, costs and safety.",
    "ঘরের সকেট, ওয়াল বক্স, পাবলিক এসি আর ডিসি ফাস্ট চার্জার: প্রতিটি কীভাবে কাজ করে, চার্জ হতে আসলে কত সময় লাগে, কানেক্টর, খরচ আর নিরাপত্তা।",
  ),
  updatedAt: REVIEWED,
  sections: [
    {
      id: "ways",
      title: L("Ways to charge", "চার্জ দেওয়ার উপায়"),
      blocks: [
        {
          type: "list",
          items: [
            L(
              "Home socket: a portable charger in a suitable household socket gives around 3 kW. Slow, but enough to top up overnight for a typical day's driving.",
              "ঘরের সকেট: উপযুক্ত ঘরোয়া সকেটে পোর্টেবল চার্জার লাগালে প্রায় ৩ কিলোওয়াট পাওয়া যায়। ধীর, তবে সাধারণ এক দিনের চালানোর জন্য রাতভর চার্জই যথেষ্ট।",
            ),
            L(
              "Wall box: a dedicated home charger, usually around 7 kW on a single-phase supply. It can fill most batteries overnight.",
              "ওয়াল বক্স: বাসার জন্য আলাদা চার্জার, সিঙ্গেল-ফেজ সংযোগে সাধারণত প্রায় ৭ কিলোওয়াট। বেশিরভাগ ব্যাটারি রাতের মধ্যেই পূর্ণ করতে পারে।",
            ),
            L(
              "Public AC: often 7–22 kW, but the car's on-board charger sets the real limit, commonly 7–11 kW.",
              "পাবলিক এসি: প্রায়ই ৭–২২ কিলোওয়াট, তবে আসল সীমা ঠিক করে গাড়ির অন-বোর্ড চার্জার, সাধারণত ৭–১১ কিলোওয়াট।",
            ),
            L(
              "DC fast charging: 50 kW and above at public stations. Ideal on longer trips, adding a large share of the battery in well under an hour.",
              "ডিসি ফাস্ট চার্জিং: পাবলিক স্টেশনে ৫০ কিলোওয়াট বা তার বেশি। লম্বা যাত্রায় আদর্শ; এক ঘণ্টার অনেক কম সময়ে ব্যাটারির বড় অংশ ভরে দেয়।",
            ),
          ],
        },
        {
          type: "diagram",
          diagram: "chargingLevels",
          caption: L("Roughly how long each type takes to add 20→80% to a 60 kWh battery.", "৬০ kWh ব্যাটারিতে ২০% থেকে ৮০% পর্যন্ত চার্জে প্রতিটি ধরনে মোটামুটি কত সময় লাগে।"),
        },
      ],
    },
    {
      id: "time",
      title: L("How long does it take?", "কত সময় লাগে?"),
      blocks: [
        {
          type: "p",
          text: L(
            "Charging time is simply the energy you add divided by the power the car can actually accept. Try your own numbers:",
            "চার্জিংয়ের সময় মানে যতটা শক্তি যোগ করছেন, তাকে গাড়ি আসলে যতটা শক্তি নিতে পারে তা দিয়ে ভাগ করা। নিজের হিসাব বসিয়ে দেখুন:",
          ),
        },
        { type: "chargingExplainer" },
      ],
    },
    {
      id: "curve",
      title: L("Why the last 20% is slower", "শেষ ২০% কেন ধীরে হয়"),
      blocks: [
        {
          type: "p",
          text: L(
            "On a DC fast charger the battery accepts its highest power when it's fairly empty. As it fills, the car reduces the power to protect the cells, often sharply above about 80%. That's why fast-charge times are usually quoted for 10–80%.",
            "ডিসি ফাস্ট চার্জারে ব্যাটারি মোটামুটি খালি থাকলে সবচেয়ে বেশি শক্তি নেয়। ভরতে থাকলে সেল সুরক্ষায় গাড়ি শক্তি কমিয়ে দেয়, প্রায় ৮০% এর পর অনেকটাই। এ কারণেই ফাস্ট চার্জিংয়ের সময় সাধারণত ১০–৮০% ধরে বলা হয়।",
          ),
        },
        {
          type: "diagram",
          diagram: "chargingCurve",
          caption: L("A simplified DC charging curve: full power to around 80%, then tapering.", "ডিসি চার্জিং কার্ভের সরল রূপ: প্রায় ৮০% পর্যন্ত পূর্ণ শক্তি, তারপর ধীরে কমে।"),
        },
        {
          type: "callout",
          tone: "tip",
          text: L(
            "On a road trip, two short stops charging to about 80% are usually quicker than one long stop charging to 100%.",
            "লম্বা যাত্রায় ৮০% পর্যন্ত দুইটি ছোট বিরতি সাধারণত ১০০% পর্যন্ত একটি লম্বা বিরতির চেয়ে দ্রুত হয়।",
          ),
        },
      ],
    },
    {
      id: "connectors",
      title: L("Plugs and connectors", "প্লাগ ও কানেক্টর"),
      blocks: [
        {
          type: "p",
          text: L(
            "Connector standards vary by vehicle and by the market a car was built for. Common ones include Type 2 for AC, CCS2 for DC, and the GB/T standard used on many cars made for the Chinese market.",
            "কানেক্টরের মান গাড়ি আর গাড়িটি কোন বাজারের জন্য তৈরি তার ওপর নির্ভর করে। প্রচলিতগুলোর মধ্যে আছে এসির জন্য টাইপ ২, ডিসির জন্য সিসিএস২, আর চীনের বাজারের জন্য তৈরি অনেক গাড়িতে ব্যবহৃত জিবি/টি।",
          ),
        },
        {
          type: "callout",
          tone: "local",
          text: L(
            "Check which connector your car uses and which ones the chargers near you support. Only use certified adapters, and only where the car's manufacturer allows them.",
            "আপনার গাড়ির কানেক্টর কোনটি, আর আশপাশের চার্জারগুলো কোনটি সমর্থন করে, মিলিয়ে নিন। শুধু সার্টিফায়েড অ্যাডাপ্টার ব্যবহার করুন, আর তা-ও কেবল যেখানে নির্মাতা অনুমতি দেয়।",
          ),
        },
      ],
    },
    {
      id: "cost",
      title: L("What charging costs", "চার্জিংয়ের খরচ"),
      blocks: [
        {
          type: "p",
          text: L(
            "At home you pay for the electricity through your normal meter, at your tariff, plus a little lost as heat. Public chargers set their own prices, which are usually higher than home charging, so check the price before you plug in.",
            "বাসায় চার্জ দিলে স্বাভাবিক মিটারে আপনার ট্যারিফ অনুযায়ী বিদ্যুতের দাম দেন, সঙ্গে তাপ হয়ে সামান্য অপচয়। পাবলিক চার্জার নিজেদের দাম ঠিক করে, যা সাধারণত বাসার চেয়ে বেশি, তাই প্লাগ লাগানোর আগে দাম দেখে নিন।",
          ),
        },
      ],
    },
    {
      id: "safety",
      title: L("Charging safely", "নিরাপদে চার্জ দেওয়া"),
      blocks: [
        {
          type: "list",
          items: [
            L("Use certified charging equipment, installed or checked by a licensed electrician.", "সার্টিফায়েড চার্জিং যন্ত্র ব্যবহার করুন, লাইসেন্সধারী ইলেকট্রিশিয়ান দিয়ে বসানো বা পরীক্ষা করানো।"),
            L("Never use extension cords or multi-plug adapters for charging.", "চার্জ দিতে কখনো এক্সটেনশন কর্ড বা মাল্টি-প্লাগ ব্যবহার করবেন না।"),
            L("Charging in the rain is designed to be safe with proper equipment, but don't charge if a cable, plug or socket is damaged or standing in water.", "সঠিক যন্ত্রে বৃষ্টিতেও নিরাপদে চার্জ দেওয়ার মতো করেই নকশা করা, তবে তার, প্লাগ বা সকেট ক্ষতিগ্রস্ত বা পানিতে ডুবে থাকলে চার্জ দেবেন না।"),
            L("Keep the connector clean and dry, and store the cable off the ground.", "কানেক্টর পরিষ্কার ও শুকনো রাখুন, আর তার মাটি থেকে তুলে রাখুন।"),
          ],
        },
      ],
    },
  ],
  faqs: [
    {
      q: L("Can I charge from a normal socket?", "সাধারণ সকেট থেকে কি চার্জ দেওয়া যায়?"),
      a: L(
        "Often yes, with the portable charger supplied with many EVs, but the socket and wiring must be in good condition and suitable for a long, steady load. Have an electrician check first.",
        "অনেক ইভির সঙ্গে দেওয়া পোর্টেবল চার্জার দিয়ে প্রায়ই পারা যায়, তবে সকেট আর ওয়্যারিং ভালো অবস্থায় এবং দীর্ঘ সময় একটানা লোড নেওয়ার উপযোগী হতে হবে। আগে একজন ইলেকট্রিশিয়ান দিয়ে দেখিয়ে নিন।",
      ),
    },
    {
      q: L("Should I charge to 100% every time?", "প্রতিবার কি ১০০% চার্জ দেওয়া উচিত?"),
      a: L(
        "Follow your manufacturer's advice. Many recommend a lower daily limit for some battery types and 100% only before a long trip.",
        "নির্মাতার পরামর্শ মেনে চলুন। কিছু ব্যাটারির ক্ষেত্রে অনেকে প্রতিদিনের জন্য কম সীমা আর শুধু লম্বা যাত্রার আগে ১০০% করার পরামর্শ দেন।",
      ),
    },
    {
      q: L("Is it safe to charge in the rain?", "বৃষ্টিতে চার্জ দেওয়া কি নিরাপদ?"),
      a: L(
        "Yes, with proper equipment in good condition: connectors are sealed and power only flows once the car and charger have checked the connection. Never charge with damaged or flooded equipment.",
        "ভালো অবস্থার সঠিক যন্ত্রে হ্যাঁ: কানেক্টর সিল করা, আর গাড়ি ও চার্জার সংযোগ যাচাই করার পরই বিদ্যুৎ চলে। ক্ষতিগ্রস্ত বা পানিতে ডোবা যন্ত্রে কখনো চার্জ দেবেন না।",
      ),
    },
  ],
  related: ["ownership-guide-bangladesh", "battery-technology", "how-evs-work"],
};
