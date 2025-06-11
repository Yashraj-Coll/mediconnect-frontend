import React, { useState } from 'react';

const BlogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);

  const featuredPost = {
    id: 0,
    title: "How AI is Revolutionizing Medical Diagnostics",
    excerpt: "Artificial intelligence is making waves in healthcare, particularly in diagnostics. Learn how AI algorithms are helping doctors detect diseases earlier and more accurately than ever before.",
    fullContent: `Artificial intelligence is fundamentally transforming the landscape of medical diagnostics, offering unprecedented accuracy and speed in disease detection. From automated radiology readings to predictive analytics for early disease detection, AI is revolutionizing how medical professionals approach patient care and diagnosis.

    Machine learning algorithms can now analyze medical images with remarkable precision, often detecting subtle patterns that might be missed by the human eye. In radiology, AI systems are being used to identify early-stage cancers, predict stroke risk, and diagnose diabetic retinopathy with accuracy rates that often exceed those of experienced specialists.

    The integration of AI in diagnostic pathways is not just about replacing human expertise—it's about augmenting it. These systems serve as powerful tools that help doctors make more informed decisions, reduce diagnostic errors, and improve patient outcomes. As we move forward, the collaboration between AI technology and medical professionals promises to deliver more personalized, accurate, and timely healthcare solutions.

    However, challenges remain in terms of data privacy, algorithm bias, and the need for continuous validation of AI systems. The future of medical diagnostics lies in the thoughtful integration of AI technologies with human expertise, ensuring that patients receive the best possible care while maintaining the human touch that is so essential to healthcare.`,
    date: "May 15, 2024",
    author: "Dr. Robert Anderson",
    authorTitle: "Chief Medical Officer",
    category: "AI & Technology",
    readTime: "8 min read",
    image: "https://images.pexels.com/photos/3825586/pexels-photo-3825586.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop",
    authorImage: "https://images.pexels.com/photos/5207262/pexels-photo-5207262.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop"
  };

  const blogPosts = [
    {
      id: 1,
      title: "Understanding Telemedicine: Benefits and Limitations",
      excerpt: "Explore how telemedicine is transforming healthcare delivery and what patients need to know before their first virtual consultation.",
      fullContent: `Telemedicine has emerged as a game-changing innovation in healthcare delivery, particularly accelerated by the global pandemic. This technology allows patients to receive medical care remotely, breaking down geographical barriers and improving access to healthcare services.

      The benefits of telemedicine are numerous. Patients can avoid travel time and costs, reduce exposure to infectious diseases, and access specialists who might not be available locally. For healthcare providers, telemedicine offers improved efficiency, better patient monitoring capabilities, and the ability to serve more patients effectively.

      However, telemedicine also has limitations. Physical examinations are restricted, technology barriers may exclude some patients, and certain conditions require in-person evaluation. Additionally, insurance coverage and regulatory frameworks are still evolving to accommodate this new mode of healthcare delivery.

      As we move forward, the integration of telemedicine with traditional healthcare will likely become the standard, offering patients more flexibility and choice in how they receive medical care.`,
      date: "May 5, 2024",
      author: "Dr. Sarah Johnson",
      category: "Telemedicine",
      readTime: "6 min read",
      image: "https://images.pexels.com/photos/4173251/pexels-photo-4173251.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop"
    },
    {
      id: 2,
      title: "Mental Health in the Digital Age",
      excerpt: "How technology is both helping and hurting our mental health, and practical strategies for maintaining digital wellness.",
      fullContent: `The digital age has brought unprecedented changes to our daily lives, profoundly impacting our mental health in both positive and negative ways. While technology offers new tools for mental health support, it also presents unique challenges that we must navigate carefully.

      On the positive side, digital mental health platforms provide accessible therapy options, mood tracking apps help individuals monitor their emotional well-being, and online communities offer support for those dealing with mental health challenges. These tools have democratized access to mental health resources, particularly for those in underserved areas.

      However, the constant connectivity of digital life can also contribute to anxiety, depression, and social isolation. Social media comparison, information overload, and the pressure to be always available can negatively impact our psychological well-being.

      The key to maintaining mental health in the digital age lies in mindful technology use. This includes setting boundaries around screen time, curating positive digital environments, and using technology as a tool to enhance rather than replace real-world connections and experiences.`,
      date: "April 28, 2024",
      author: "Dr. Emma Roberts",
      category: "Mental Health",
      readTime: "7 min read",
      image: "https://images.pexels.com/photos/6393342/pexels-photo-6393342.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Preventive Care: Your Health Investment",
      excerpt: "Why preventive healthcare is the smartest investment you can make and how to get started with a preventive care plan.",
      fullContent: `Preventive healthcare represents one of the most valuable investments you can make in your long-term well-being. By focusing on preventing diseases before they occur, rather than treating them after they develop, preventive care can significantly improve your quality of life while reducing healthcare costs.

      The foundation of preventive care includes regular health screenings, vaccinations, lifestyle counseling, and early detection programs. These interventions can identify risk factors and health issues before they become serious problems, allowing for early intervention and better outcomes.

      Key components of an effective preventive care plan include annual physical exams, age-appropriate screening tests (such as mammograms, colonoscopies, and blood pressure checks), maintaining up-to-date vaccinations, and lifestyle modifications like regular exercise, healthy eating, and stress management.

      The economic benefits of preventive care are substantial. Studies show that every dollar spent on preventive care can save $3-4 in treatment costs down the line. More importantly, preventive care helps you maintain your health, independence, and quality of life as you age.`,
      date: "April 20, 2024",
      author: "Dr. Michael Chen",
      category: "Preventive Care",
      readTime: "5 min read",
      image: "https://images.pexels.com/photos/40568/medical-appointment-doctor-healthcare-40568.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop"
    },
    {
      id: 4,
      title: "Nutrition Science: Latest Research",
      excerpt: "Recent breakthrough discoveries in nutrition science and their implications for personalized healthcare approaches.",
      fullContent: `The field of nutrition science is rapidly evolving, with new research providing deeper insights into how our diet affects our health at the cellular and genetic levels. Recent breakthroughs in nutrigenomics—the study of how genes interact with nutrients—are paving the way for truly personalized nutrition recommendations.

      One of the most significant developments is our understanding of the gut microbiome's role in overall health. Research shows that the trillions of bacteria in our digestive system influence everything from immune function to mental health, and that dietary choices can significantly alter this microbial ecosystem.

      Another breakthrough area is precision nutrition, which takes into account individual genetic variations, lifestyle factors, and health status to provide personalized dietary recommendations. This approach moves beyond one-size-fits-all dietary guidelines to offer targeted interventions that can optimize health outcomes for each individual.

      Recent studies have also revealed the importance of nutrient timing, food combinations, and the quality of food sources in determining health outcomes. These findings are reshaping how we think about nutrition and its role in preventing and treating chronic diseases.`,
      date: "April 15, 2024",
      author: "Dr. Lisa Wang",
      category: "Nutrition",
      readTime: "9 min read",
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop"
    },
    {
      id: 5,
      title: "Wearable Health Tech: Future Trends",
      excerpt: "Exploring the latest innovations in wearable health technology and how they're reshaping personal health monitoring.",
      fullContent: `Wearable health technology is transforming from simple fitness trackers to sophisticated medical devices capable of continuous health monitoring. The latest generation of wearables can track everything from heart rate variability and blood oxygen levels to sleep patterns and stress indicators.

      Emerging technologies in wearable health include continuous glucose monitoring for non-diabetics, advanced ECG capabilities, blood pressure monitoring, and even early detection of infections through changes in vital signs. These devices are becoming increasingly accurate and are beginning to provide clinical-grade data that can inform medical decisions.

      The integration of artificial intelligence with wearable technology is enabling predictive health analytics. These systems can identify patterns in your health data that might indicate the early stages of illness, allowing for proactive interventions before symptoms appear.

      Privacy and data security remain important considerations as these devices collect increasingly sensitive health information. The future of wearable health tech will need to balance innovation with robust privacy protections to maintain user trust and comply with healthcare regulations.`,
      date: "April 10, 2024",
      author: "Dr. James Park",
      category: "Technology",
      readTime: "6 min read",
      image: "https://images.pexels.com/photos/267394/pexels-photo-267394.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop"
    },
    {
      id: 6,
      title: "Sleep Health: Beyond the Basics",
      excerpt: "Advanced insights into sleep science and evidence-based strategies for optimizing your sleep quality and duration.",
      fullContent: `Sleep is far more than just rest—it's a complex biological process essential for physical health, mental well-being, and cognitive function. Recent advances in sleep science have revealed the intricate mechanisms behind sleep and its profound impact on virtually every aspect of our health.

      Quality sleep affects immune function, hormone regulation, memory consolidation, and cellular repair processes. Poor sleep has been linked to increased risk of cardiovascular disease, diabetes, obesity, and mental health disorders. Understanding these connections emphasizes the critical importance of prioritizing sleep health.

      Modern sleep science has identified several key factors that influence sleep quality: circadian rhythm regulation, sleep environment optimization, stress management, and the timing of food, exercise, and light exposure. Each of these factors can be modified to improve sleep outcomes.

      Emerging technologies, including sleep tracking devices and light therapy, are providing new tools for optimizing sleep. However, the fundamentals remain unchanged: consistent sleep schedules, comfortable sleep environments, and healthy lifestyle habits are the foundation of good sleep hygiene.`,
      date: "April 5, 2024",
      author: "Dr. Rachel Kim",
      category: "Sleep Health",
      readTime: "8 min read",
      image: "https://images.pexels.com/photos/935777/pexels-photo-935777.jpeg?auto=compress&cs=tinysrgb&w=500&h=400&fit=crop"
    }
  ];

  const categories = ["All", "AI & Technology", "Telemedicine", "Mental Health", "Preventive Care", "Nutrition", "Technology", "Sleep Health"];

  const filteredPosts = selectedCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const handleReadMore = (post) => {
    setSelectedArticle(post);
  };

  const handleBackToBlog = () => {
    setSelectedArticle(null);
  };

  // Individual Article View
  if (selectedArticle) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Article Header */}
        <div className="pt-32 pb-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              {/* Back Button */}
              <button 
                onClick={handleBackToBlog}
                className="flex items-center text-purple-600 hover:text-purple-800 mb-8 transition-colors duration-300"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                <span>Back to Blog</span>
              </button>

              {/* Category Badge */}
              <div className="mb-6">
                <span className="bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
                  {selectedArticle.category}
                </span>
              </div>

              {/* Article Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {selectedArticle.title}
              </h1>

              {/* Article Meta */}
              <div className="flex items-center mb-8">
                <img 
                  src={selectedArticle.image}
                  alt={selectedArticle.author}
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
                <div>
                  <p className="font-semibold text-gray-900">{selectedArticle.author}</p>
                  <p className="text-gray-600 text-sm">{selectedArticle.date} • {selectedArticle.readTime}</p>
                </div>
              </div>

              {/* Featured Image */}
              <div className="mb-12">
                <img 
                  src={selectedArticle.image}
                  alt={selectedArticle.title}
                  className="w-full h-96 object-cover rounded-xl shadow-lg"
                />
              </div>

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                {selectedArticle.fullContent.split('\n\n').map((paragraph, index) => (
                  <p key={index} className="mb-6 text-gray-700 leading-relaxed text-lg">
                    {paragraph.trim()}
                  </p>
                ))}
              </div>

              {/* Article Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-4">Share this article:</span>
                    <div className="flex space-x-3">
                      <button className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors">
                        <i className="fab fa-facebook-f"></i>
                      </button>
                      <button className="w-10 h-10 bg-blue-400 text-white rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors">
                        <i className="fab fa-twitter"></i>
                      </button>
                      <button className="w-10 h-10 bg-blue-800 text-white rounded-full flex items-center justify-center hover:bg-blue-900 transition-colors">
                        <i className="fab fa-linkedin-in"></i>
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={handleBackToBlog}
                    className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Read More Articles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Blog View
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
          <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-4000"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <i className="fas fa-blog text-white mr-3"></i>
              <span className="text-white font-medium">Health Insights & Medical Updates</span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
              MediConnect <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">Blog</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
              Expert insights, latest research, and practical health advice from our team of medical professionals and healthcare innovators.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">50+</div>
                <div className="text-blue-100">Expert Articles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">15</div>
                <div className="text-blue-100">Medical Experts</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <div className="text-4xl font-bold text-white mb-2">10K+</div>
                <div className="text-blue-100">Monthly Readers</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Article */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-purple-100 rounded-full px-6 py-3 mb-6">
              <i className="fas fa-star text-purple-600 mr-3"></i>
              <span className="text-purple-800 font-medium">Featured Article</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest <span className="text-purple-600">Insights</span>
            </h2>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="lg:flex">
                {/* Image Side */}
                <div className="lg:w-2/5 relative overflow-hidden">
                  <div className="h-80 lg:h-96 relative">
                    <img 
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-4 left-4">
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        {featuredPost.category}
                      </span>
                    </div>

                    {/* Read Time Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                        <i className="fas fa-clock mr-1"></i>
                        {featuredPost.readTime}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="lg:w-3/5 p-8 lg:p-10">
                  <div className="h-full flex flex-col justify-center">
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      {featuredPost.title}
                    </h3>
                    
                    <p className="text-lg text-gray-600 leading-relaxed mb-4">
                      {featuredPost.excerpt}
                    </p>

                    {/* Author Info */}
                    <div className="flex items-center mb-6">
                      <img 
                        src={featuredPost.authorImage}
                        alt={featuredPost.author}
                        className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-purple-100"
                      />
                      <div>
                        <p className="text-base font-bold text-gray-900">{featuredPost.author}</p>
                        <p className="text-purple-600 font-medium text-sm">{featuredPost.authorTitle}</p>
                        <p className="text-gray-500 text-sm">{featuredPost.date}</p>
                      </div>
                    </div>

                    {/* Action Button */}
                    <button 
                      onClick={() => handleReadMore(featuredPost)}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center w-fit"
                    >
                      <span>Read Full Article</span>
                      <i className="fas fa-arrow-right ml-2"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Browse by Category</h2>
            <p className="text-gray-600">Find articles that interest you most</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
            {categories.map((category, index) => (
              <button
                key={index}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category
                    ? 'bg-purple-600 text-white shadow-lg' 
                    : 'bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-600 shadow-md hover:shadow-lg'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-blue-100 rounded-full px-6 py-3 mb-6">
              <i className="fas fa-newspaper text-blue-600 mr-3"></i>
              <span className="text-blue-800 font-medium">
                {selectedCategory === 'All' ? 'Latest Articles' : `${selectedCategory} Articles`}
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {selectedCategory === 'All' ? (
                <>Health & <span className="text-blue-600">Wellness</span> Insights</>
              ) : (
                <><span className="text-blue-600">{selectedCategory}</span> Articles</>
              )}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {filteredPosts.length} article{filteredPosts.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {filteredPosts.map((post, index) => (
              <article 
                key={post.id} 
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border border-gray-100"
              >
                {/* Image with Overlay */}
                <div className="relative overflow-hidden">
                  <div className="h-48 relative">
                    <img 
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
                    
                    {/* Category Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                        {post.category}
                      </span>
                    </div>

                    {/* Read Time */}
                    <div className="absolute bottom-3 right-3">
                      <div className="bg-black/70 backdrop-blur-sm text-white px-2 py-1 rounded text-xs">
                        <i className="fas fa-clock mr-1"></i>
                        {post.readTime}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 leading-tight group-hover:text-purple-600 transition-colors duration-300 line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Author & Date */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs mr-3">
                        {post.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{post.author}</p>
                        <p className="text-xs text-gray-500">{post.date}</p>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleReadMore(post)}
                      className="text-purple-600 font-medium hover:text-purple-800 transition-colors duration-300 text-sm group-hover:transform group-hover:translate-x-1"
                    >
                      <span className="mr-1">Read</span>
                      <i className="fas fa-arrow-right text-xs"></i>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <i className="fas fa-search text-6xl"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
              <p className="text-gray-500">Try selecting a different category</p>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter Subscription */}
      <div className="py-20 bg-gray-900 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-20"></div>
        </div>

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 mb-8">
              <i className="fas fa-envelope text-white mr-3"></i>
              <span className="text-white font-medium">Stay Updated</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-8">
              Never Miss a Health Update
            </h2>
            
            <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Subscribe to our newsletter and get the latest health insights, research findings, and expert advice delivered to your inbox weekly.
            </p>

            <div className="max-w-md mx-auto">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-6 py-4 rounded-l-full border-0 bg-white/10 backdrop-blur-sm text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-4 rounded-r-full font-bold hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  Subscribe
                </button>
              </div>
              <p className="text-gray-400 text-sm mt-4">
                Join 10,000+ healthcare professionals and patients who trust our insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Font Awesome */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
    </div>
  );
};
export default BlogPage;
