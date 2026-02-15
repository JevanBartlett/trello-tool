// Trello API type definitions
// These interfaces mirror the shape of data returned by Trello's REST API

import { z } from 'zod';

export const dateStringSchema = z
  .string()
  .refine((val) => !Number.isNaN(new Date(val).getTime()), { message: 'Invalid date format' })
  .transform((val) => new Date(val).toISOString());

export const LabelSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string().nullable(),
});

export const MemberSchema = z.object({
  fullName: z.string(),
});

export const BoardSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export const ListSchema = z.object({
  id: z.string(),
  name: z.string(),
  idBoard: z.string(),
});

export const CardSchema = z.object({
  id: z.string(),
  name: z.string(),
  desc: z.string(),
  idList: z.string(),
  due: z.string().nullable(),
  labels: z.array(LabelSchema),
});

export type TrelloLabel = z.infer<typeof LabelSchema>;

export type TrelloMember = z.infer<typeof MemberSchema>;

export type TrelloBoard = z.infer<typeof BoardSchema>;

export type TrelloList = z.infer<typeof ListSchema>;

export type TrelloCard = z.infer<typeof CardSchema>;
