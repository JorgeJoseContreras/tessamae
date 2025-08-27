import React from 'react';

const LegalPage: React.FC = () => {
  return (
    <div className="container mx-auto px-6 animate-slide-in-up">
      <div className="max-w-3xl mx-auto py-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-center select-none">Privacy Policy</h1>
        
        <div className="mt-12 space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 select-none">Third-Party Services</h2>
            <p>
              This application utilizes several third-party APIs and services to provide its features. By using this site, you acknowledge and agree to the terms of these services.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>
                <strong className="text-brand-pink">Google Gemini API:</strong> Used for all generative AI features, including the chat functionality, lyric generation, and creative idea generation. Your interactions with the AI are processed by Google's servers.
              </li>
              <li>
                <strong className="text-brand-pink">Google Apps Script:</strong> Used to securely handle song submissions. When you submit a song, the data is sent to a private Google Sheet and Google Drive folder owned by the site administrator.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 select-none">Data Privacy Disclaimer</h2>
            <p>
              We are committed to protecting your privacy. When you use the song submission feature, you are required to provide your name and email address.
            </p>
            <ul className="list-disc list-inside mt-4 space-y-2">
              <li>
                <strong>Use of Information:</strong> Your name and email address are collected solely for the purpose of contacting you regarding your song submission if it is considered for release.
              </li>
              <li>
                <strong>Data Security:</strong> We do not store your personal information on our own servers. The submission is handled securely by Google Apps Script and saved directly to a private Google Sheet.
              </li>
              <li>
                <strong>No Selling of Data:</strong> We will never sell, rent, or share your personal information with third parties for marketing purposes.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-3 select-none">User-Generated Content</h2>
            <p>
              By submitting lyrics and other content through the "Submit for Release" feature, you grant Adamo Group Holdings Limited Company a non-exclusive, worldwide, royalty-free license to use, reproduce, and distribute the content in connection with the Tessa Mae project. You also affirm that you are entitled to 50% of any and all royalties generated from the commercial release of the submitted song. If your submission is selected, you will be contacted via the email address you provided to arrange the setup of your royalty split.
            </p>
          </section>
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-3 select-none">Ownership and Contact</h2>
            <p>
              This project is owned and operated by Adamo Group Holdings Limited Company, an LLC based in New Mexico. For any legal inquiries or other questions, please contact us at <a href="mailto:aghlc.nm@gmail.com" className="text-brand-purple hover:text-brand-pink underline">aghlc.nm@gmail.com</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default LegalPage;