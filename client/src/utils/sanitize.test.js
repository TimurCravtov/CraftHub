import { describe, test, expect } from 'vitest';
import {
    escapeText,
    escapeHtml,
    safeUrl,
    sanitizeEmail,
    validateEmailFormat,
    sanitizeEmailForDisplay,
    sanitizePassword,
    sanitizeName,
    sanitizeNameForDisplay,
    sanitizeUserInput
} from './sanitize';

describe('Sanitization Utilities', () => {

    describe('escapeText', () => {
        test('should return an empty string for null or undefined input', () => {
            expect(escapeText(null)).toBe('');
            expect(escapeText(undefined)).toBe('');
        });

        test('should escape special HTML characters', () => {
            const input = '<script>alert("xss")</script>';
            const expected = '&lt;script&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
            expect(escapeText(input)).toBe(expected);
        });

        test('should handle numbers and other types', () => {
            expect(escapeText(123)).toBe('123');
            expect(escapeText(true)).toBe('true');
        });
    });

    describe('escapeHtml', () => {
        test('should escape more characters than escapeText', () => {
            const input = '<script a=`b` c=d>alert("xss")</script>';
            const expected = '&lt;script a&#x3D;&#x60;b&#x60; c&#x3D;d&gt;alert(&quot;xss&quot;)&lt;&#x2F;script&gt;';
            expect(escapeHtml(input)).toBe(expected);
        });
    });

    describe('safeUrl', () => {
        test('should allow http and https protocols', () => {
            expect(safeUrl('http://example.com')).toBe('http://example.com');
            expect(safeUrl('https://example.com')).toBe('https://example.com');
        });

        test('should block javascript URLs', () => {
            expect(safeUrl('javascript:alert("xss")')).toBe('');
        });

        test('should allow relative URLs', () => {
            expect(safeUrl('/path/to/resource')).toBe('/path/to/resource');
        });

        test('should return an empty string for invalid URLs', () => {
            expect(safeUrl('invalid-url')).toBe('');
        });
    });

    describe('sanitizeEmail', () => {
        test('should remove dangerous protocols from email', () => {
            const input = 'javascript:alert("xss")@example.com';
            const expected = 'alert(&quot;xss&quot;)@example.com';
            expect(sanitizeEmail(input)).toBe(expected);
        });
    });

    describe('validateEmailFormat', () => {
        test('should return true for valid email formats', () => {
            expect(validateEmailFormat('test@example.com')).toBe(true);
        });

        test('should return false for invalid email formats', () => {
            expect(validateEmailFormat('test@.com')).toBe(false);
            expect(validateEmailFormat('test@com')).toBe(false);
            expect(validateEmailFormat('test.com')).toBe(false);
        });
    });

    describe('sanitizeEmailForDisplay', () => {
        test('should remove dangerous protocols without escaping', () => {
            const input = 'javascript:alert("xss")@example.com';
            expect(sanitizeEmailForDisplay(input)).toBe('alert("xss")@example.com');
        });
    });

    describe('sanitizePassword', () => {
        test('should remove event handlers', () => {
            const input = 'pass onload=alert(1)';
            expect(sanitizePassword(input)).toBe('pass alert(1)');
        });
    });

    describe('sanitizeName', () => {
        test('should only allow letters, numbers, spaces, and -_.', () => {
            const input = 'My Name!@#$%^&*()123-_.';
            const expected = 'My Name123-_.';
            expect(sanitizeName(input)).toBe(expected);
        });
    });

    describe('sanitizeNameForDisplay', () => {
        test('should behave like sanitizeName', () => {
            const input = 'My Name!@#$%^&*()123-_.';
            const expected = 'My Name123-_.';
            expect(sanitizeNameForDisplay(input)).toBe(expected);
        });
    });

    describe('sanitizeUserInput', () => {
        test('should escape text and remove dangerous parts', () => {
            const input = '<b onclick=alert(1)>test</b>';
            const expected = '&lt;b alert(1)&gt;test&lt;&#x2F;b&gt;';
            expect(sanitizeUserInput(input)).toBe(expected);
        });
    });
});
