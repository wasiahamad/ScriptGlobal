import { contentController } from './content.controller.js';
import ContactInquiry from '../models/ContactInquiry.model.js';
import { failure, success } from '../utils/apiResponse.js';
export const contactController = contentController('contact');

export async function createContactInquiry(req, res) { return success(res, await ContactInquiry.create(req.body), 'Inquiry submitted successfully', null, 201); }
export async function listContactInquiries(req, res) { return success(res, await ContactInquiry.find().sort({ createdAt: -1 }).limit(100).lean(), 'Inquiries fetched successfully'); }
export async function updateContactInquiryStatus(req, res) { const item = await ContactInquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true, runValidators: true }); return item ? success(res, item, 'Inquiry status updated successfully') : failure(res, 'Inquiry not found', [], 404); }
export async function deleteContactInquiry(req, res) { const item = await ContactInquiry.findByIdAndDelete(req.params.id); return item ? success(res, item, 'Inquiry deleted successfully') : failure(res, 'Inquiry not found', [], 404); }
