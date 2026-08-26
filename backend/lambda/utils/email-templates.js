// ============================================================================
// EMAIL TEMPLATES - Far Too Young Donation Receipt System
// ============================================================================

const FRONTEND_URL = process.env.FRONTEND_URL || 'https://fartooyoung.org';

// 100 random personal messages from the founder
const founderMessages = [
  "Every donation reminds me why we started this. Thank you for believing in these girls.",
  "I started Far Too Young because every girl deserves a childhood. You're helping make that real.",
  "When I see the impact our donors make, it keeps me going. Thank you.",
  "You're part of something that will outlast all of us. These girls will remember.",
  "This means the world to me and to the girls we serve. Thank you.",
  "I read every donation that comes in. Yours made my day.",
  "Behind every number is a girl who gets to stay in school. That's because of you.",
  "We can't do this without people like you. Seriously, thank you.",
  "Your support tells these girls that someone out there cares. And that matters.",
  "I think about the girls we help every single day. Thank you for being part of their story.",
  "You just made someone's future a little brighter. That's powerful.",
  "The work we do is only possible because of people like you.",
  "Thank you for trusting us with your generosity. We don't take it lightly.",
  "One day I hope to tell you the stories of the girls you've helped. They're incredible.",
  "Your kindness travels further than you'll ever know.",
  "I wish you could see the smiles your donation creates. Thank you.",
  "This isn't charity to me. It's personal. Thank you for making it personal to you too.",
  "Every girl we help is proof that people like you exist. Thank you.",
  "I'm grateful every single day for supporters like you.",
  "You just gave a girl permission to dream. That's not small.",
  "We're building something real here. Thank you for being part of it.",
  "Your generosity keeps me motivated to do more. Thank you.",
  "I hope you know how much this matters. To me, and to them.",
  "There's a girl out there who will never know your name, but she'll feel your kindness.",
  "Thank you for showing up. That's what this is about.",
  "You're helping end something that should never have existed. Thank you.",
  "I don't have enough words, but I have two: Thank you.",
  "Your donation isn't just money. It's opportunity, safety, and hope.",
  "Sometimes one person deciding to care changes everything. You're that person today.",
  "We're a small team with a big mission, and you just made it more possible.",
  "Every girl deserves someone in her corner. Today, you're that someone.",
  "I never get tired of saying thank you, because I never get tired of being grateful.",
  "You just invested in a girl's future. That's the best kind of investment.",
  "The world needs more people like you. Thank you for caring.",
  "Your donation just became a girl's next chapter. Thank you.",
  "I can't explain what it feels like to know people like you are out there. Thank you.",
  "This work is hard. But donors like you make it worth every moment.",
  "You chose to make a difference today. That choice matters more than you know.",
  "A girl's life just got a little easier because of you. Thank you.",
  "I believe in a world without child marriage. Your donation tells me you do too.",
  "Thank you for standing with us. It means everything.",
  "Your generosity is a message to every girl: you are worth fighting for.",
  "I started this organization alone. Now I have supporters like you. That changes everything.",
  "You just proved that strangers can change lives. Thank you.",
  "Every time someone donates, I'm reminded that humanity is good. Thank you.",
  "Your support keeps the lights on and the girls in school. Thank you.",
  "I hope one day you'll see the full impact of what you've done today.",
  "You're not just helping one girl. You're changing what's possible for thousands.",
  "Thank you for not looking away. Thank you for choosing to act.",
  "Your donation is a promise to a girl you've never met. And we'll keep that promise.",
  "I read stories every week about the girls we help. You're now part of those stories.",
  "The best part of my job is knowing people like you exist. Thank you.",
  "You turned compassion into action today. That's rare and powerful.",
  "I hope this donation feels as good to give as it does to receive on behalf of these girls.",
  "Thank you for being the kind of person who makes the world better.",
  "Your contribution just became a girl's school supplies, her uniform, her chance.",
  "I don't take a single donation for granted. Yours means the world.",
  "You chose us, and we won't let you down. Thank you.",
  "Some people talk about change. You just made it happen.",
  "Every donation is a vote for the world you want to see. Thank you for voting.",
  "I wish every girl we serve could thank you personally. For now, I'll do it for them.",
  "Your generosity just gave a girl the most powerful gift: time in a classroom.",
  "You're helping us prove that child marriage can end. One girl at a time.",
  "Thank you for caring about girls you'll never meet. That's what makes you special.",
  "I've seen what education does for these girls. You just funded that transformation.",
  "Your donation lands in a girl's life like sunshine after rain. Thank you.",
  "We don't just accept donations. We honor them. Thank you for yours.",
  "You didn't have to give. You chose to. That choice means everything.",
  "I think about our donors often. You're the reason this mission is alive.",
  "Thank you for believing that one person can make a difference. You just did.",
  "A girl just got closer to finishing school because of you. That's amazing.",
  "Your support isn't just financial. It's emotional. It tells us we're not alone in this fight.",
  "I know there are a million places you could have put this money. Thank you for choosing us.",
  "You just joined a community of people who refuse to accept child marriage. Welcome.",
  "Every girl we reach is evidence that your donation worked. Thank you.",
  "I started this because I was angry about injustice. Your donation channels that anger into hope.",
  "Thank you for being part of the solution. The world needs you.",
  "Your donation just traveled across the world to protect a girl's future.",
  "I wake up every morning thinking about these girls. Thank you for giving me the tools to help them.",
  "You're not just a donor. You're a partner in this mission. Thank you.",
  "Some people scroll past. You stopped and gave. That makes all the difference.",
  "I hope you feel proud today. You should. Thank you.",
  "Your generosity is the bridge between a girl's hardship and her potential.",
  "Thank you for trusting a small organization with a big dream.",
  "You just made a girl's tomorrow a little less uncertain. Thank you.",
  "I'll never stop being amazed by the generosity of people like you.",
  "Your donation says to a girl: your education matters. Your future matters. You matter.",
  "Thank you for choosing impact over indifference.",
  "This donation will ripple forward in ways neither of us can fully imagine.",
  "I'm humbled by your support. Truly. Thank you.",
  "You just made Far Too Young a little stronger today. And that makes girls safer.",
  "Thank you for giving without expecting anything in return. That's pure generosity.",
  "A girl somewhere just got a lifeline. And it came from you.",
  "Your donation doesn't just help one girl. It inspires an entire community.",
  "Thank you for refusing to be a bystander. You're a changemaker now.",
  "I've dedicated my life to this cause. Your donation tells me I'm not alone.",
  "You just gave hope to a girl who desperately needed it. Thank you.",
  "Some gifts change lives. Yours is one of them.",
  "Thank you for seeing these girls. For caring. For acting.",
  "I can't do this work without people like you. From the bottom of my heart, thank you."
];

// 15 random greeting messages (the main body text)
const greetingMessages = [
  "You just gave a girl a chance she wouldn't have had otherwise. That means more than you know. Thank you.",
  "Sometimes one person deciding to care changes everything. You're that person today. Thank you.",
  "There's a girl out there who will never know your name, but she'll feel your kindness every single day. Thank you.",
  "What you just did matters more than words can say. A girl's future just got brighter because of you.",
  "Your generosity isn't just a number. It's a girl staying in school, staying safe, staying hopeful. Thank you.",
  "You chose to make a difference today and that choice will echo in a girl's life for years to come.",
  "Not everyone acts when they see injustice. You did. That's what sets you apart. Thank you.",
  "A girl you've never met just got a better shot at life. That's the power of what you did today.",
  "Your support means a girl gets to keep learning, keep dreaming, keep being a kid. Thank you.",
  "In a world full of noise, your donation is a quiet act of extraordinary kindness. Thank you.",
  "You just told a girl that her education matters, her safety matters, she matters. Thank you.",
  "Every girl deserves someone willing to stand up for her future. Today, you're that someone.",
  "What you've done today will outlive this moment. A girl's life is better because you cared.",
  "You didn't look away. You showed up. That's everything. Thank you.",
  "Your kindness just crossed borders and changed a life. That's remarkable. Thank you."
];

// Impact statements based on donation amount ranges
function getImpactStatement(amount) {
  if (amount >= 500) return `Your $${amount} transforms an entire classroom of girls' futures. That's dozens of lives changed because of your extraordinary generosity.`;
  if (amount >= 250) return `Your $${amount} funds after-school mentorship for 5 girls. That's safety, guidance, and inspiration when they need it most.`;
  if (amount >= 150) return `Your $${amount} keeps 3 girls in school for a full month. That's 90 days of education, safety, and hope combined.`;
  if (amount >= 100) return `Your $${amount} provides a full scholarship for 1 girl for a semester. That's months of learning she wouldn't have had otherwise.`;
  if (amount >= 50) return `Your $${amount} covers school fees for 1 girl for an entire term. That's three months of education, friendships, and growth.`;
  if (amount >= 25) return `Your $${amount} keeps 1 girl in school for an entire month. That's 30 days of learning, safety, and hope.`;
  if (amount >= 10) return `Your $${amount} provides menstrual hygiene kits for 2 girls, keeping them in school when they'd otherwise miss days every month.`;
  return `Your $${amount} provides school supplies for a girl for a week. Every bit counts, and she'll feel the difference.`;
}

// Pick random item from array
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Format amount to 2 decimal places
function formatAmount(amount) {
  return Number(amount).toFixed(2);
}

// Format date nicely
function formatDate(dateStr) {
  const date = new Date(dateStr || Date.now());
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

// Generate donation receipt HTML
function generateDonationReceipt({ firstName, amount, donationType, paymentMethod, transactionId, date }) {
  const formattedAmount = formatAmount(amount);
  const formattedDate = formatDate(date);
  const isMonthly = donationType === 'monthly';
  const impact = getImpactStatement(Number(amount));
  const greeting = pickRandom(greetingMessages);
  const founderNote = pickRandom(founderMessages);
  
  // Badge colors
  const badgeBg = isMonthly ? '#dcfce7' : '#fef3c7';
  const badgeColor = isMonthly ? '#166534' : '#92400e';
  const badgeText = isMonthly ? 'Monthly' : 'One-time';
  
  // Monthly upsell section (only for one-time donations)
  const monthlyUpsell = isMonthly ? '' : `<tr><td style='background-color:#ffffff;padding:0 40px;'><div style='background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:12px;padding:24px;margin-bottom:30px;text-align:center;border:1px solid #bbf7d0;'><p style='margin:0 0 8px;font-size:15px;color:#166534;font-weight:600;'>Want 12x the impact?</p><p style='margin:0 0 16px;font-size:14px;color:#15803d;line-height:1.5;'>$${formattedAmount}/month means ${Math.round(Number(amount) * 12 / 25)} girls in school every year.<br>Consistent support helps us plan ahead and reach more girls.</p><a href='${FRONTEND_URL}/?donate=monthly&amount=${amount}' style='display:inline-block;background:linear-gradient(135deg,#16a34a,#15803d);color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;'>Become a Monthly Supporter</a></div></td></tr>`;

  const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap' rel='stylesheet'></head><body style='margin:0;padding:0;background-color:#f8fafc;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;'><table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f8fafc;padding:30px 0;'><tr><td align='center'><table width='604' cellpadding='0' cellspacing='0' style='max-width:604px;width:100%;border:2px solid #f97316;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(249,115,22,0.1);'><tr><td style='background:linear-gradient(135deg,#0a0a14 0%,#1a1a2e 100%);padding:20px 40px 20px;text-align:center;'><a href='${FRONTEND_URL}'><img src='https://fartooyoung.org/assets/email-logo.png' alt='Far Too Young' style='height:220px;margin:0;'></a><div style='height:2px;background:linear-gradient(90deg,transparent,#f97316,#fbbf24,transparent);margin:12px 20px 0;'></div></td></tr><tr><td style='background-color:#ffffff;padding:30px 40px 0;text-align:center;'><div style='display:inline-block;background:#ffffff;border-radius:50%;width:60px;height:60px;line-height:60px;font-size:28px;border:3px solid #f97316;margin-bottom:20px;'>&#10003;</div><p style='font-size:14px;color:#1f2937;margin:0 0 4px;text-transform:uppercase;letter-spacing:1.5px;font-weight:600;'>Donation Received</p><p style='font-size:48px;color:#16a34a;font-weight:800;margin:8px 0 6px;font-family:Inter,sans-serif;'>$${formattedAmount}</p><p style='font-size:14px;color:#4b5563;margin:0 0 8px;font-weight:500;'>${formattedDate}</p><span style='display:inline-block;background:${badgeBg};color:${badgeColor};font-size:12px;font-weight:700;padding:4px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:30px;'>${badgeText}</span><p style='font-size:18px;color:#1f2937;margin:0 0 8px;line-height:1.6;text-align:left;'><span style='font-family:Playfair Display,Georgia,serif;color:#f97316;font-weight:700;'>${firstName || 'Friend'},</span></p><p style='font-size:16px;color:#374151;margin:0 0 30px;line-height:1.6;text-align:left;'>${greeting} <span style='font-size:20px;'>&#128591;</span></p></td></tr><tr><td style='background-color:#ffffff;padding:0 40px;'><div style='background:#f3f4f6;border-radius:12px;padding:20px 24px;margin-bottom:30px;'><table width='100%' cellpadding='0' cellspacing='0'><tr><td style='padding:10px 0;'><span style='color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:500;'>Payment</span></td><td style='padding:10px 0;text-align:right;'><span style='color:#1f2937;font-size:14px;font-weight:600;'>${paymentMethod || 'Card'}</span></td></tr><tr><td style='padding:10px 0;border-top:1px solid #e5e7eb;'><span style='color:#6b7280;font-size:13px;text-transform:uppercase;letter-spacing:0.5px;font-weight:500;'>Reference</span></td><td style='padding:10px 0;border-top:1px solid #e5e7eb;text-align:right;'><span style='color:#1f2937;font-size:13px;font-family:monospace;font-weight:500;'>${transactionId || ''}</span></td></tr></table></div></td></tr><tr><td style='background-color:#ffffff;padding:0 40px;'><div style='background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:12px;padding:24px;margin-bottom:30px;text-align:center;border:1px solid #bfdbfe;'><p style='margin:0 0 4px;font-size:28px;'>&#127775;</p><p style='margin:0 0 6px;font-size:16px;color:#1e40af;font-weight:700;'>Your Impact</p><p style='margin:0;font-size:15px;color:#1e3a5f;line-height:1.5;'>${impact}</p></div></td></tr>${monthlyUpsell}<tr><td style='background-color:#ffffff;padding:0 40px 30px;text-align:center;'><a href='${FRONTEND_URL}/dashboard' style='display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;box-shadow:0 4px 12px rgba(249,115,22,0.25);'>View Your Impact Dashboard</a></td></tr><tr><td style='background-color:#ffffff;padding:0 40px 30px;'><div style='background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;'><div style='height:2px;background:linear-gradient(90deg,#f97316,#fbbf24);border-radius:2px;margin-bottom:16px;'></div><table width='100%' cellpadding='0' cellspacing='0'><tr><td width='56' style='vertical-align:top;padding-right:16px;'><a href='${FRONTEND_URL}/founder-team'><img src='https://fartooyoung.org/assets/email-avinash.jpg' alt='Avinash Sharma' style='width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #f97316;'></a></td><td style='vertical-align:top;'><p style='font-size:15px;color:#374151;margin:0 0 14px;line-height:1.6;font-style:italic;'>&ldquo;${founderNote}&rdquo;</p><img src='https://fartooyoung.org/assets/email-signature-v2.png' alt='Avinash Sharma signature' style='width:140px;margin-bottom:8px;display:block;'><p style='font-size:15px;margin:0 0 2px;'><a href='${FRONTEND_URL}/founder-team' style='text-decoration:none;'><span style='font-family:Playfair Display,Georgia,serif;color:#f97316;font-weight:700;'>Avinash Sharma</span></a></p><p style='font-size:13px;color:#6b7280;margin:0;'>Founder</p></td></tr></table></div></td></tr><tr><td style='background-color:#f9fafb;padding:24px 40px;border-top:1px solid #f3f4f6;'><p style='font-size:12px;color:#374151;margin:0;line-height:1.7;text-align:center;'>Far Too Young is a registered 501(c)(3) nonprofit. EIN: 93-3769961.<br>No goods or services were provided in exchange for this contribution.<br>This receipt is your official record for tax purposes.</p></td></tr><tr><td style='background:linear-gradient(135deg,#0a0a14 0%,#1a1a2e 100%);padding:32px 40px;text-align:center;'><p style='color:#e5e7eb;font-size:13px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1.5px;font-weight:500;'>Follow Us</p><table cellpadding='0' cellspacing='0' style='margin:0 auto 20px;'><tr><td style='padding:0 14px;'><a href='https://www.instagram.com/fartooyoung_organization/'><img src='https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png' alt='Instagram' width='32' height='32' style='display:block;'></a></td><td style='padding:0 14px;'><a href='https://www.facebook.com/fartooyoung.org'><img src='https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png' alt='Facebook' width='32' height='32' style='display:block;'></a></td><td style='padding:0 14px;'><a href='https://www.youtube.com/@FarTooYoungInc'><img src='https://img.icons8.com/ios-filled/50/ffffff/youtube-play.png' alt='YouTube' width='32' height='32' style='display:block;'></a></td></tr></table><div style='height:1px;background:linear-gradient(90deg,transparent,#374151,transparent);margin:0 40px 20px;'></div><p style='margin:0 0 6px;'><a href='${FRONTEND_URL}' style='color:#f97316;text-decoration:none;font-weight:600;font-size:16px;'>fartooyoung.org</a></p><p style='color:#9ca3af;font-size:13px;margin:0;'>Far Too Young &middot; Ending child marriage, one girl at a time.</p></td></tr></table></td></tr></table></body></html>`;

  const isStaging = FRONTEND_URL.includes('staging');
  const subjectPrefix = isStaging ? '[TEST] ' : '';

  return {
    subject: `${subjectPrefix}Thank you for your $${formattedAmount} donation 💛`,
    html
  };
}

// Generate welcome email HTML (sent after email verification)
function generateWelcomeEmail({ firstName }) {
  const isStaging = FRONTEND_URL.includes('staging');
  const subjectPrefix = isStaging ? '[TEST] ' : '';
  const name = firstName || 'Friend';

  const founderNote = pickRandom(founderMessages);

  const html = `<!DOCTYPE html><html><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1.0'><link href='https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700&display=swap' rel='stylesheet'></head><body style='margin:0;padding:0;background-color:#f8fafc;font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica,Arial,sans-serif;'><table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f8fafc;padding:30px 0;'><tr><td align='center'><table width='604' cellpadding='0' cellspacing='0' style='max-width:604px;width:100%;border:2px solid #f97316;border-radius:18px;overflow:hidden;box-shadow:0 4px 24px rgba(249,115,22,0.1);'><tr><td style='background:linear-gradient(135deg,#0a0a14 0%,#1a1a2e 100%);padding:20px 40px 20px;text-align:center;'><a href='${FRONTEND_URL}'><img src='https://fartooyoung.org/assets/email-logo.png' alt='Far Too Young' style='height:220px;margin:0;'></a><div style='height:2px;background:linear-gradient(90deg,transparent,#f97316,#fbbf24,transparent);margin:12px 20px 0;'></div></td></tr><tr><td style='background-color:#ffffff;padding:30px 40px 0;text-align:center;'><div style='display:inline-block;background:#ffffff;border-radius:50%;width:60px;height:60px;line-height:60px;font-size:28px;border:3px solid #f97316;margin-bottom:16px;'>&#128155;</div><p style='font-size:30px;color:#f97316;font-weight:800;margin:0 0 6px;font-family:Inter,sans-serif;'>Welcome</p><p style='font-size:15px;color:#1f2937;font-weight:700;margin:0 0 35px;'>Small team. Big mission. You&rsquo;re in.</p><p style='font-size:18px;color:#1f2937;margin:0 0 8px;line-height:1.6;text-align:left;'><span style='font-family:Playfair Display,Georgia,serif;color:#f97316;font-weight:700;'>${name},</span></p><p style='font-size:16px;color:#374151;margin:0 0 16px;line-height:1.6;text-align:left;'>Thank you for joining us on this journey. Every year, 12 million girls are married before they turn 18. That&rsquo;s 23 girls every minute losing their childhood, their education, and their future.</p><p style='font-size:16px;color:#374151;margin:0 0 30px;line-height:1.6;text-align:left;'>These are real girls. With real names, real dreams. She&rsquo;s 12. She should be in school. Instead, she&rsquo;s someone&rsquo;s wife. We refuse to accept that. And now, so do you. <span style='font-size:20px;'>&#128591;</span></p></td></tr><tr><td style='background-color:#ffffff;padding:0 40px;'><div style='background:linear-gradient(135deg,#eff6ff,#dbeafe);border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #bfdbfe;'><p style='margin:0 0 12px;font-size:16px;color:#1e40af;font-weight:700;'>What We Do</p><p style='margin:0 0 10px;font-size:15px;color:#1e3a5f;line-height:1.6;'><strong>Education</strong> &mdash; We fund school fees, supplies, and uniforms so girls stay in classrooms, not marriages.</p><p style='margin:0 0 10px;font-size:15px;color:#1e3a5f;line-height:1.6;'><strong>Advocacy</strong> &mdash; We work with communities and governments to change laws and shift cultural norms.</p><p style='margin:0 0 16px;font-size:15px;color:#1e3a5f;line-height:1.6;'><strong>Mentorship</strong> &mdash; We pair girls with mentors who guide them through adolescence safely.</p><a href='${FRONTEND_URL}/what-we-do' style='color:#1e40af;font-size:14px;font-weight:600;text-decoration:none;'>Learn more about our work &rarr;</a></div></td></tr><tr><td style='background-color:#ffffff;padding:0 40px;'><div style='background:linear-gradient(135deg,#f0fdf4,#dcfce7);border-radius:12px;padding:24px;margin-bottom:20px;border:1px solid #bbf7d0;'><p style='margin:0 0 12px;font-size:16px;color:#166534;font-weight:700;'>What Your Dollar Does</p><p style='margin:0 0 6px;font-size:15px;color:#15803d;line-height:1.6;'><strong>$10</strong> &mdash; Provides hygiene kits that keep a girl in school all month</p><p style='margin:0 0 6px;font-size:15px;color:#15803d;line-height:1.6;'><strong>$25</strong> &mdash; One full month of school for a girl who&rsquo;d otherwise be married off</p><p style='margin:0 0 6px;font-size:15px;color:#15803d;line-height:1.6;'><strong>$50</strong> &mdash; Covers a full term of school fees</p><p style='margin:0;font-size:15px;color:#15803d;line-height:1.6;'><strong>$150</strong> &mdash; Keeps 3 girls in school for an entire month</p></div></td></tr><tr><td style='background-color:#ffffff;padding:0 40px;'><div style='background:linear-gradient(135deg,#fdf4ff,#fae8ff);border-radius:12px;padding:24px;margin-bottom:30px;border:1px solid #e9d5ff;'><p style='margin:0 0 8px;font-size:16px;color:#6b21a8;font-weight:700;'>Stories That Matter</p><p style='margin:0 0 12px;font-size:15px;color:#581c87;line-height:1.6;'>Every week, our team tracks what&rsquo;s happening with child marriage worldwide. We read the reports, analyze the data, and break it down. Real data. Real stories. We do the work so you don&rsquo;t have to.</p><a href='${FRONTEND_URL}/blog' style='color:#6b21a8;font-size:14px;font-weight:600;text-decoration:none;'>Read our latest stories &rarr;</a></div></td></tr><tr><td style='background-color:#ffffff;padding:0 40px 16px;'><p style='font-size:15px;color:#374151;margin:0;line-height:1.6;text-align:center;'>If our work speaks to you, even a small donation helps us keep going.<br>Every dollar goes directly to keeping girls in school and out of forced marriages.</p></td></tr><tr><td style='background-color:#ffffff;padding:0 40px 30px;text-align:center;'><a href='${FRONTEND_URL}/?donate=one-time' style='display:inline-block;background:linear-gradient(135deg,#f97316,#ea580c);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;box-shadow:0 4px 12px rgba(249,115,22,0.25);'>Make a Donation</a></td></tr><tr><td style='background-color:#ffffff;padding:0 40px 30px;'><div style='background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;'><div style='height:2px;background:linear-gradient(90deg,#f97316,#fbbf24);border-radius:2px;margin-bottom:16px;'></div><table width='100%' cellpadding='0' cellspacing='0'><tr><td width='56' style='vertical-align:top;padding-right:16px;'><a href='${FRONTEND_URL}/founder-team'><img src='https://fartooyoung.org/assets/email-avinash.jpg' alt='Avinash Sharma' style='width:48px;height:48px;border-radius:50%;object-fit:cover;border:2px solid #f97316;'></a></td><td style='vertical-align:top;'><p style='font-size:15px;color:#374151;margin:0 0 14px;line-height:1.6;font-style:italic;'>&ldquo;${founderNote}&rdquo;</p><img src='https://fartooyoung.org/assets/email-signature-v2.png' alt='Avinash Sharma signature' style='width:140px;margin-bottom:8px;display:block;'><p style='font-size:15px;margin:0 0 2px;'><a href='${FRONTEND_URL}/founder-team' style='text-decoration:none;'><span style='font-family:Playfair Display,Georgia,serif;color:#f97316;font-weight:700;'>Avinash Sharma</span></a></p><p style='font-size:13px;color:#6b7280;margin:0;'>Founder</p></td></tr></table></div></td></tr><tr><td style='background-color:#f9fafb;padding:24px 40px;border-top:1px solid #f3f4f6;'><p style='font-size:12px;color:#374151;margin:0;line-height:1.7;text-align:center;'>Far Too Young is a registered 501(c)(3) nonprofit organization.<br>EIN: 93-3769961 &middot; fartooyoung.org</p></td></tr><tr><td style='background:linear-gradient(135deg,#0a0a14 0%,#1a1a2e 100%);padding:32px 40px;text-align:center;'><p style='color:#e5e7eb;font-size:13px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1.5px;font-weight:500;'>Follow Us</p><table cellpadding='0' cellspacing='0' style='margin:0 auto 20px;'><tr><td style='padding:0 14px;'><a href='https://www.instagram.com/fartooyoung_organization/'><img src='https://img.icons8.com/ios-filled/50/ffffff/instagram-new.png' alt='Instagram' width='32' height='32' style='display:block;'></a></td><td style='padding:0 14px;'><a href='https://www.facebook.com/fartooyoung.org'><img src='https://img.icons8.com/ios-filled/50/ffffff/facebook-new.png' alt='Facebook' width='32' height='32' style='display:block;'></a></td><td style='padding:0 14px;'><a href='https://www.youtube.com/@FarTooYoungInc'><img src='https://img.icons8.com/ios-filled/50/ffffff/youtube-play.png' alt='YouTube' width='32' height='32' style='display:block;'></a></td></tr></table><div style='height:1px;background:linear-gradient(90deg,transparent,#374151,transparent);margin:0 40px 20px;'></div><p style='margin:0 0 6px;'><a href='${FRONTEND_URL}' style='color:#f97316;text-decoration:none;font-weight:600;font-size:16px;'>fartooyoung.org</a></p><p style='color:#9ca3af;font-size:13px;margin:0;'>Far Too Young &middot; Ending child marriage, one girl at a time.</p></td></tr></table></td></tr></table></body></html>`;

  return {
    subject: `${subjectPrefix}Welcome to Far Too Young, ${name}!`,
    html
  };
}

module.exports = { generateDonationReceipt, generateWelcomeEmail };
