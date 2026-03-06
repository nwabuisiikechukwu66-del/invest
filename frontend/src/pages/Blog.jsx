import React from 'react';
import { useReveal } from '@hooks/useReveal';
import PageHeader from '@components/PageHeader';
import { BLOG_POSTS } from '@data/constants';

export default function Blog() {
  useReveal();

  return (
    <>
      <PageHeader
        tag="Insights"
        title="Investment Insights"
        subtitle="Market analysis, investment strategies, and real estate education from our research team."
      />
      <section className="section">
        <div className="container">
          <div className="blog-grid">
            {BLOG_POSTS.map((post) => (
              <div key={post.id} className="blog-card reveal">
                <div className="blog-img">
                  <img src={post.image} alt={post.title} loading="lazy" />
                </div>
                <div className="blog-body">
                  <div className="blog-category">{post.category}</div>
                  <div className="blog-title">{post.title}</div>
                  <div className="blog-excerpt">{post.excerpt}</div>
                  <div className="blog-meta">
                    <span>{post.date}</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
