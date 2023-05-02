import { email } from './regex';

describe('Email regex', () => {
    test('Valid email address', () => {
        /** Local part*/
        expect(email.test('simple@example.com')).toBeTruthy();
        // One letter local part
        expect(email.test('x@example.com')).toBeTruthy();
        expect(email.test('very.common@example.com')).toBeTruthy();
        // Printable characters !#$%&'*+-/=?^_`{|}~ are allowed
        expect(email.test('disposable.style.email.with+symbol@example.com')).toBeTruthy();
        expect(email.test('other.email-with-hyphen@example.com')).toBeTruthy();
        expect(email.test('fully-qualified-domain@example.com')).toBeTruthy();
        expect(email.test('user.name+tag+sorting@example.com')).toBeTruthy();
        expect(email.test('example-indeed@strange-example.com')).toBeTruthy();
        expect(email.test('user-@example.org')).toBeTruthy();
        expect(email.test('mailhost!username@example.org')).toBeTruthy();
        expect(email.test('test/test@test.com')).toBeTruthy();
        expect(email.test('user%example.com@example.org')).toBeTruthy();
        // Space and special characters "(),:;<>@[\] are only allowed inside a quoted string.
        // In that quoted string, any backslash or double-quote must be preceded once by a backslash
        expect(email.test('" "@example.org')).toBeTruthy();
        // Quoted double dot
        expect(email.test('"john..doe"@example.org')).toBeTruthy();
        expect(email.test('".John.Doe"@example.com')).toBeTruthy();
        // eslint-disable-next-line
        expect(email.test(`"very.(),:;<>[]\".VERY.\"very@\\ \"very\".unusual"@strange.example.com`)).toBeTruthy();
        expect(email.test('" ewc429 (%($^)*_)*(&&R%$&$&^$#     "@example.com')).toBeTruthy();
        expect(email.test('"UYFG)O^R&|.:;(%&*]T*T*[&GIU"@example.com')).toBeTruthy();

        /** Domain part*/
        // The domain may be an IP address literal, surrounded by square brackets []
        expect(email.test('postmaster@[123.123.123.123]')).toBeTruthy();
        // Printable characters in the local part and IP address domain part combinations are allowed
        expect(email.test("john.smith!#$%&'*+-/=?^_`{|}~@[12.2.12.45]")).toBeTruthy();
        expect(email.test("john!#$%&'*+-/=?^_`{|}~.smith@[12.2.12.45]")).toBeTruthy();
        expect(
            email.test("john!#$%&'*+-/=?^_`{|}~.smith!#$%&'*+-/=?^_`{|}~.efwe!#$%&'*+-/=?^_`{|}~.weoihefw.!#$%&'*+-/=?^_`{|}~@[12.2.12.45]")
        ).toBeTruthy();
        // Domain part is a one or more alphanumeric strings separated by a dot.
        expect(email.test('john.smith@abc-12CB-FVCbh45.co')).toBeTruthy();
        expect(email.test('x@x.co')).toBeTruthy();
        expect(email.test('john.smith@abc-12CB-FVCbh45-979HVU.uk.us.mrweew.co')).toBeTruthy();
        expect(email.test('john.smith@abc-12CB-FVCbh45-979HVU.uk-weoh-238y23-ewfioh234.us-wefwef.mrweew.co')).toBeTruthy();
    });

    test('Invalid email address', () => {
        // No @ character
        expect(email.test('Abc.example.com')).toBeFalsy();
        // Only one @ is allowed
        expect(email.test('A@b@c@example.com')).toBeFalsy();

        /** Invalid local part*/
        // Icon characters [] should be inside quote
        expect(email.test('QA[icon]CHOCOLATE[icon]@test.com')).toBeFalsy();
        // Quoted strings must be making up the local-part
        expect(email.test('just"not"right@example.com')).toBeFalsy();
        // The `.` in the local part shouldn't be consecutive
        expect(email.test('john..smith@example.com')).toBeFalsy();
        // The `.` in the local part shouldn't be at the beginning or end
        expect(email.test('.john.smith@example.com')).toBeFalsy();
        expect(email.test('john.smith.@example.com')).toBeFalsy();
        // Local part shouldn't contain not latin characters
        expect(email.test('あいうえお@example.com')).toBeFalsy();
        // Space and special characters "(),:;<>@[\] are only allowed inside a quoted string, and in that quoted string, any backslash or double-quote must be preceded once by a backslash
        expect(email.test('UYFGO^R&%;&*T*T*&GIU@example.com')).toBeFalsy();
        expect(email.test('UYFGO^R&% &*T*T*&GIU@example.com')).toBeFalsy();
        // eslint-disable-next-line
        expect(email.test(`this is"not\allowed@example.com`)).toBeFalsy();
        // Even if escaped (preceded by a backslash), spaces, quotes, and backslashes must still be contained by quotes
        // eslint-disable-next-line
        expect(email.test(`this\ still\"not\\allowed@example.com`)).toBeFalsy();
        // eslint-disable-next-line
        expect(email.test(`a"b(c)d,e:f;g<h>i[j\k]l@example.com`)).toBeFalsy();

        /** Invalid domain part */
        // Underscore is not allowed in domain part
        expect(email.test('i_like_underscore@but_its_not_allowed_in_this_part.example.com')).toBeFalsy();
        // Domain part components must not start with a `-` or end with it
        expect(email.test('john.smith@abc-12CB-.co')).toBeFalsy();
        expect(email.test('john.smith@-12CB-FVCbh45.co')).toBeFalsy();
        // Domain last component must be alphabetical string.
        expect(email.test('john.smith@abc-12CB-FVCbh45.co5')).toBeFalsy();
        // Domain part before and after dot should be at least 2 characters
        expect(email.test('john.smith@1.c')).toBeFalsy();
        // Domain part can be an IP address of four of 1-3 long numbers separated by a dot.
        expect(email.test('john.smith@[12.2.6.45].com')).toBeFalsy();
        // Any address with a number above 255 in it is invalid.
        expect(email.test('john.smith@[12.2.2.344]')).toBeFalsy();
        expect(email.test('john.smith@[12.2.2.]')).toBeFalsy();
    });
});
