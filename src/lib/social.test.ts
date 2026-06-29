/* @vitest-environment node */

import { describe, expect, it } from 'vitest';
import {
  deriveProjectStats,
  filterProjectsForFeed,
  toggleResonanceState,
  type SocialProject,
} from './social';

const projects: SocialProject[] = [
  {
    id: 'quantum-lab',
    title: 'Quantum Field Notes',
    abstract: 'Bench notes for entanglement experiments.',
    content: 'Long form research notes',
    author_id: 'ada',
    author_name: 'Ada Lovelace',
    author_username: 'ada',
    tags: ['Quantum', 'Experiment'],
    created_at: '2026-06-01T12:00:00.000Z',
    updated_at: '2026-06-01T12:00:00.000Z',
    resonance_count: 7,
    fork_count: 2,
    comment_count: 3,
    has_resonated: false,
    is_following_author: true,
    is_trending: true,
  },
  {
    id: 'bio-lab',
    title: 'Wet Lab Protocol',
    abstract: 'A reproducible biology protocol.',
    content: 'Protocol details',
    author_id: 'grace',
    author_name: 'Grace Hopper',
    author_username: 'grace',
    tags: ['Biology'],
    created_at: '2026-06-02T12:00:00.000Z',
    updated_at: '2026-06-02T12:00:00.000Z',
    resonance_count: 1,
    fork_count: 0,
    comment_count: 0,
    has_resonated: false,
    is_following_author: false,
    is_trending: false,
  },
];

describe('filterProjectsForFeed', () => {
  it('filters the feed by search text across title, abstract, author, and tags', () => {
    expect(filterProjectsForFeed(projects, { query: 'quantum', filter: 'trending' }).map((project) => project.id)).toEqual([
      'quantum-lab',
    ]);

    expect(filterProjectsForFeed(projects, { query: 'hopper', filter: 'trending' }).map((project) => project.id)).toEqual([
      'bio-lab',
    ]);
  });

  it('orders new projects by creation date and narrows following to followed authors', () => {
    expect(filterProjectsForFeed(projects, { query: '', filter: 'new' }).map((project) => project.id)).toEqual([
      'bio-lab',
      'quantum-lab',
    ]);

    expect(filterProjectsForFeed(projects, { query: '', filter: 'following' }).map((project) => project.id)).toEqual([
      'quantum-lab',
    ]);
  });
});

describe('toggleResonanceState', () => {
  it('increments the count when a project is resonated and decrements when removed', () => {
    const resonated = toggleResonanceState(projects[0], true);

    expect(resonated.has_resonated).toBe(true);
    expect(resonated.resonance_count).toBe(8);

    const removed = toggleResonanceState(resonated, false);

    expect(removed.has_resonated).toBe(false);
    expect(removed.resonance_count).toBe(7);
  });

  it('never lets resonance counts go below zero', () => {
    const removed = toggleResonanceState({ ...projects[1], resonance_count: 0 }, false);

    expect(removed.resonance_count).toBe(0);
  });
});

describe('deriveProjectStats', () => {
  it('uses real relationship counts instead of stale display numbers', () => {
    expect(
      deriveProjectStats(projects[0], {
        comments: [{ id: 'comment-1' }, { id: 'comment-2' }],
        resonances: [{ user_id: 'ada' }],
        forks: [{ id: 'fork-1' }, { id: 'fork-2' }, { id: 'fork-3' }],
        currentUserId: 'ada',
      }),
    ).toEqual({
      resonance_count: 1,
      fork_count: 3,
      comment_count: 2,
      has_resonated: true,
    });
  });
});
