// emailReader.js - exports a function for startup invocation

const Imap = require('imap');
const { simpleParser } = require('mailparser');
const pdfParse = require('pdf-parse');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
require('dotenv').config();

const prisma = new PrismaClient();

function checkEmails() {
  const imap = new Imap({
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
  });

  function openInbox(cb) {
    imap.openBox('INBOX', false, cb);
  }

  imap.once('ready', function () {
    openInbox(function (err, box) {
      if (err) {
        console.error('📭 Failed to open inbox:', err);
        return imap.end();
      }

      const since = new Date();
      since.setDate(since.getDate() - 2);

      imap.search(['UNSEEN', ['SINCE', since.toDateString()]], function (err, results) {
        if (err || !results.length) {
          console.log('📭 No new emails with PDF attachments.');
          imap.end();
          return;
        }

        const f = imap.fetch(results, { bodies: '', struct: true });

        f.on('message', function (msg, seqno) {
          msg.on('body', function (stream) {
            simpleParser(stream, async (err, parsed) => {
              if (err) return console.error('✉️ Parsing failed:', err);
              const attachments = parsed.attachments.filter(att => att.contentType === 'application/pdf');

              for (const att of attachments) {
                try {
                  const pdfBuffer = att.content;
                  const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

                  const duplicate = await prisma.ledger.findUnique({ where: { pdfHash: hash } });
                  if (duplicate) {
                    console.log('⚠️ Duplicate PDF, skipping.');
                    continue;
                  }

                  const data = await pdfParse(pdfBuffer);
                  const text = data.text;
                  console.log('📄 PDF Text:', text.substring(0, 200));

                  const dateMatch = text.match(/\d{4}-\d{2}-\d{2}/) || text.match(/\d{2}\/\d{2}\/\d{4}/);
                  const amountMatch = text.match(/\$?\d+\.\d{2}/i);
                  const lines = text.split('\n').filter(Boolean);

                  let vendor = 'Unknown Vendor';
                  for (let i = 0; i < Math.min(5, lines.length); i++) {
                    const line = lines[i].trim();
                    if (/\d{2}\/\d{2}\/\d{4}|\d{4}-\d{2}-\d{2}|\$?\d+\.\d{2}/.test(line)) continue;
                    vendor = line;
                    break;
                  }

                  const description = vendor;

                  if (dateMatch && amountMatch) {
                    const dateObj = new Date(dateMatch[0]);
                    const amountNum = parseFloat(amountMatch[0].replace('$', ''));

                    await prisma.ledger.upsert({
                      where: { pdfHash: hash },
                      update: {},
                      create: {
                        date: dateObj,
                        amount: amountNum,
                        description,
                        source: 'Email',
                        pdfHash: hash,
                      },
                    });

                    console.log(`✅ Saved to DB: ${description}, $${amountNum}`);
                  } else {
                    console.log('⚠️ Incomplete PDF data.');
                  }
                } catch (e) {
                  console.error('🚨 Error processing attachment:', e);
                }
              }
            });
          });
        });

        f.once('end', function () {
          console.log('📬 Done processing emails.');
          imap.end();
        });
      });
    });
  });

  imap.once('error', function (err) {
    console.error('📉 IMAP error:', err);
  });

  imap.once('end', function () {
    console.log('📪 IMAP connection closed.');
  });

  imap.connect();
}

module.exports = checkEmails;
