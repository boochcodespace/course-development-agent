import { describe, expect, it } from 'vitest';
import {
  LMS_PROFILES,
  buildRiseSpecMessage,
  checkObjective,
  validateRiseSpecRequest,
  type RiseSpecRequest,
} from '@/lib/rise-spec';

const base: RiseSpecRequest = {
  topic: 'Refund approval rules',
  objective: 'Apply the four refund approval rules to three customer disputes.',
  persona: 'A support agent handling an escalated refund.',
  lmsProfile: 'generic',
};

describe('checkObjective', () => {
  it('accepts an Apply-level verb', () => {
    expect(checkObjective('Apply the four rules to three disputes').level).toBe('ok');
  });

  it('strips common lead-ins before reading the verb', () => {
    expect(checkObjective('By the end of this component, the learner will be able to apply the rules.').level).toBe('ok');
    expect(checkObjective('Learners will understand the rules.').level).toBe('vague');
    expect(checkObjective('You will be able to troubleshoot a failed sync.').level).toBe('ok');
  });

  it('blocks vague verbs', () => {
    for (const text of ['Understand allocation', 'Learn the process', 'Know the policy', 'Appreciate the value']) {
      expect(checkObjective(text).level).toBe('vague');
    }
  });

  it('warns on Remember and Understand verbs without blocking', () => {
    expect(checkObjective('Define the four rules').level).toBe('low');
    expect(checkObjective('Explain why the rules exist').level).toBe('low');
  });

  it('asks for text when empty', () => {
    expect(checkObjective('   ').level).toBe('missing');
  });
});

describe('validateRiseSpecRequest', () => {
  it('accepts a complete request', () => {
    expect(validateRiseSpecRequest(base)).toBeNull();
  });

  it('requires the three core fields', () => {
    expect(validateRiseSpecRequest({ ...base, topic: ' ' })).toMatch(/topic/i);
    expect(validateRiseSpecRequest({ ...base, objective: '' })).toMatch(/objective/i);
    expect(validateRiseSpecRequest({ ...base, persona: '' })).toMatch(/learner/i);
  });

  it('rejects an unknown LMS profile and an unknown interaction type', () => {
    expect(validateRiseSpecRequest({ ...base, lmsProfile: '../../etc' })).toMatch(/LMS profile/);
    expect(validateRiseSpecRequest({ ...base, interactionPreference: 'carousel' })).toMatch(/interaction type/);
  });

  it('rejects a vague objective on the server too', () => {
    expect(validateRiseSpecRequest({ ...base, objective: 'Understand refund rules' })).toMatch(/can't be observed/);
  });

  it('enforces length limits', () => {
    expect(validateRiseSpecRequest({ ...base, topic: 'x'.repeat(301) })).toMatch(/topic/i);
  });

  it('handles a missing body', () => {
    expect(validateRiseSpecRequest(null)).toBeTruthy();
  });

  it('offers at least the generic profile', () => {
    expect(LMS_PROFILES.some((p) => p.id === 'generic')).toBe(true);
  });
});

describe('buildRiseSpecMessage', () => {
  it('includes the inputs and asks for placeholder tokens when none are given', () => {
    const msg = buildRiseSpecMessage(base);
    expect(msg).toContain('Refund approval rules');
    expect(msg).toContain('No brand tokens were supplied');
  });

  it('includes supplied tokens and source content', () => {
    const msg = buildRiseSpecMessage({ ...base, brandTokens: '--brand-primary: #123456;', sourceContent: 'SME notes here' }, 'Branching scenario');
    expect(msg).toContain('--brand-primary: #123456;');
    expect(msg).toContain('SME notes here');
    expect(msg).toContain('Branching scenario');
  });
});
