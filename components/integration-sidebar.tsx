"use client";

import {
	createDocument,
	deleteDocument,
	getDocumentContentForExport,
} from "@/actions/docs";
import {
	Collapsible,
	CollapsibleContent,
	CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DiscordIcon } from "@/components/ui/icons/discord";
import { GithubIcon } from "@/components/ui/icons/github";
import { GmailIcon } from "@/components/ui/icons/gmail";
import { GoogleCalendarIcon } from "@/components/ui/icons/google-calendar";
import { GoogleDocsIcon } from "@/components/ui/icons/google-docs";
import { LinearIcon } from "@/components/ui/icons/linear";
import { MsTeamsIcon } from "@/components/ui/icons/ms-teams";
import { NotionIcon } from "@/components/ui/icons/notion";
import { SlackIcon } from "@/components/ui/icons/slack";
import { T0Logo } from "@/components/ui/icons/t0-logo";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuAction,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarRail,
	SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { downloadFile } from "@/lib/download";
import { TOUR_STEP_IDS } from "@/lib/tour-constants";
import { cn } from "@/lib/utils";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {
	Check,
	ChevronDown,
	Download,
	FileText,
	FolderOpen,
	LayoutGrid,
	Loader2,
	LogIn,
	Merge,
	MoreHorizontal,
	PanelRight,
	Plus,
	Settings,
	Trash2,
	X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import * as React from "react";
import { toast } from "sonner";
import { CommandMenu } from "./command-menu";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";

interface Document {
	id: string;
	name: string;
	content?: string;
	createdAt?: string;
	userId: string;
}

export function MinimalIntegrationSidebar({ documents = [] as Document[] }) {
	const router = useRouter();
	const [isCreatingDoc, setIsCreatingDoc] = useState(false);
	const [newDocName, setNewDocName] = useState("");
	const [state, formAction, isPending] = React.useActionState(
		createDocument,
		undefined,
	);
	const pathname = usePathname();

	const [isDeleting, startDeleteTransition] = useTransition();
	const [isExporting, startExportTransition] = useTransition();
	const [pendingDocId, setPendingDocId] = useState<string | null>(null);

	useEffect(() => {
		if (state?.success && state.data?.documentId) {
			toast.success("Document created successfully");
			router.push(`/docs/${state.data.documentId}`);
			setIsCreatingDoc(false);
			setNewDocName("");
		} else if (!state?.success && state?.error) {
			toast.error(state.error);
		}
	}, [state, router]);

	const handleExport = async (docId: string, docName: string) => {
		setPendingDocId(docId);
		startExportTransition(async () => {
			try {
				const result = await getDocumentContentForExport(docId);
				if (result.success && result.data) {
					downloadFile(`${docName}.md`, result.data.content, "text/markdown");
					toast.success(`Exported "${docName}.md"`);
				} else {
					toast.error(result.error || "Failed to export document content.");
				}
			} catch (error) {
				console.error("Export error:", error);
				toast.error("An unexpected error occurred during export.");
			} finally {
				setPendingDocId(null);
			}
		});
	};

	const handleDelete = async (docId: string, docName: string) => {
		if (
			!window.confirm(
				`Are you sure you want to delete "${docName}"? This action cannot be undone.`,
			)
		) {
			return;
		}

		setPendingDocId(docId);
		startDeleteTransition(async () => {
			try {
				const result = await deleteDocument(docId);
				if (result.success) {
					toast.success(`Document "${docName}" deleted successfully`);
					if (pathname === `/docs/${docId}`) {
						router.push("/home");
					}
					router.refresh();
				} else {
					toast.error(result.error || "Failed to delete document.");
				}
			} catch (error) {
				console.error("Delete error:", error);
				toast.error("An unexpected error occurred during deletion.");
			} finally {
				setPendingDocId(null);
			}
		});
	};

	const integrations = [
		{ name: "GitHub", icon: GithubIcon, link: "/integrations/github" },
		{ name: "Notion", icon: NotionIcon, link: "/integrations/notion" },
		{ name: "Linear", icon: LinearIcon, link: "/integrations/linear" },
		{ name: "Discord", icon: DiscordIcon, link: "/integrations/discord" },
		{
			name: "Slack",
			icon: SlackIcon,
			link: "/integrations/slack",
			disabled: true,
			status: "Soon",
		},
		{
			name: "Gmail",
			icon: GmailIcon,
			link: "/integrations/gmail",
			disabled: true,
			status: "Soon",
		},
		{
			name: "Google Calendar",
			icon: GoogleCalendarIcon,
			link: "/integrations/google-calendar",
			disabled: true,
			status: "Soon",
		},
		{
			name: "Google Docs",
			icon: GoogleDocsIcon,
			link: "/integrations/google-docs",
			disabled: true,
			status: "Soon",
		},
		{
			name: "Microsoft Teams",
			icon: MsTeamsIcon,
			link: "/integrations/microsoft-teams",
			disabled: true,
			status: "Soon",
		},
	];

	return (
		<TooltipProvider delayDuration={0}>
			<Sidebar
				collapsible="icon"
				className="relative flex h-full flex-col border-border border-r bg-background text-foreground transition-all duration-300 ease-in-out"
			>
				{/* Header with Text0 Logo */}
				<SidebarHeader className="flex w-full flex-row justify-between group-data-[collapsible=icon]:flex-col">
					<div className="flex items-center gap-2">
						<Link
							href="/"
							className={cn(
								"flex items-center gap-2",
								"group-data-[collapsible=icon]:flex-col",
							)}
							aria-label="Text0 Home"
						>
							<div className="flex items-center justify-center rounded-lg bg-foreground p-2 transition-colors duration-150 hover:bg-foreground/80">
								<T0Logo
									className={cn(
										"h-4 w-4 text-primary",
										"group-data-[collapsible=icon]:h-4 group-data-[collapsible=icon]:w-4",
									)}
								/>
							</div>
							<span className="font-semibold text-foreground group-data-[collapsible=icon]:hidden">
								text0
							</span>
						</Link>
					</div>
					<SidebarMenuButton
						tooltip="Toggle Sidebar"
						className="flex h-8 w-8 items-center justify-center"
						asChild
						id={TOUR_STEP_IDS.SIDEBAR_TOGGLE}
					>
						<SidebarTrigger>
							<PanelRight className="h-4 w-4" />
						</SidebarTrigger>
					</SidebarMenuButton>
				</SidebarHeader>

				<SidebarContent className="flex-1 gap-0">
					{/* Command Menu */}
					<SidebarGroup>
						<div className="relative w-full" id={TOUR_STEP_IDS.COMMAND_MENU}>
							<CommandMenu
								documents={documents}
								onCreateDocument={() => {
									const newDocButton = document.querySelector(
										"[data-new-doc-trigger]",
									);
									if (newDocButton instanceof HTMLElement) {
										newDocButton.click();
									}
								}}
								variant="default"
								className="group-data-[collapsible=icon]:variant-icon w-full"
							/>
						</div>
					</SidebarGroup>

					{/* Main Navigation */}
					<SidebarGroup className="flex-1">
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									tooltip="Home"
									className="flex w-full items-center justify-start gap-2 px-2 py-1.5 text-sm group-data-[collapsible=icon]:justify-center"
								>
									<Link
										href="/home"
										data-active={pathname === "/home"}
										className="flex w-full items-center gap-2 text-muted-foreground group-data-[collapsible=icon]:justify-center"
									>
										<LayoutGrid className="h-4 w-4 shrink-0" />
										<span className="truncate group-data-[collapsible=icon]:hidden">
											Home
										</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>

							{/* Documents Section */}
							<SidebarMenuItem>
								<Collapsible defaultOpen={true} className="w-full">
									<CollapsibleTrigger asChild>
										<SidebarMenuButton
											tooltip="My Documents"
											className="flex w-full items-center gap-2 px-2 py-1.5 text-muted-foreground text-sm hover:bg-accent hover:text-foreground group-data-[collapsible=icon]:justify-center"
											id={TOUR_STEP_IDS.MY_DOCUMENTS}
										>
											<FolderOpen className="h-4 w-4 shrink-0" />
											<span className="truncate font-medium tracking-wide group-data-[collapsible=icon]:hidden">
												My Documents
											</span>
											<ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-180" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<ScrollArea className="h-auto max-h-70">
											<div className="space-y-1">
												<div className="sticky top-0 ml-4 border-border border-l border-dashed px-2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0">
													{isCreatingDoc ? (
														<form
															action={formAction}
															className="flex items-center gap-1 group-data-[collapsible=icon]:hidden"
														>
															<input
																type="hidden"
																name="pathname"
																defaultValue={pathname}
															/>
															<Input
																name="name"
																placeholder="Document name"
																value={newDocName}
																onChange={(e) => setNewDocName(e.target.value)}
																onKeyDown={(e) => {
																	if (e.key === "Escape") {
																		e.preventDefault();
																		setIsCreatingDoc(false);
																		setNewDocName("");
																	}
																}}
																className="h-8 text-sm dark:bg-muted"
																autoFocus
																disabled={isPending}
															/>
															<div className="flex gap-1">
																<SidebarMenuButton
																	type="submit"
																	size="sm"
																	tooltip="Create document"
																	className="h-8 w-8"
																	disabled={isPending || !newDocName.trim()}
																>
																	{isPending ? (
																		<div className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
																	) : (
																		<Check className="h-4 w-4" />
																	)}
																</SidebarMenuButton>
																<SidebarMenuButton
																	type="button"
																	size="sm"
																	tooltip="Cancel"
																	className="h-8 w-8"
																	onClick={() => {
																		setIsCreatingDoc(false);
																		setNewDocName("");
																	}}
																	disabled={isPending}
																>
																	<X className="h-4 w-4" />
																</SidebarMenuButton>
															</div>
														</form>
													) : (
														<SidebarMenuButton
															variant="outline"
															size="sm"
															tooltip="New Document"
															className="flex h-8 w-full items-center justify-start gap-2 border border-border bg-background pl-2 text-sm group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pr-0 group-data-[collapsible=icon]:pl-0 dark:bg-muted"
															onClick={() => setIsCreatingDoc(true)}
															data-new-doc-trigger
														>
															<Plus className="h-4 w-4 shrink-0" />
															<span className="group-data-[collapsible=icon]:hidden">
																New Document
															</span>
														</SidebarMenuButton>
													)}
												</div>
												{documents.map((doc) => {
													const isDocPending = pendingDocId === doc.id;
													const isDocBeingDeleted = isDocPending && isDeleting;
													const isDocBeingExported =
														isDocPending && isExporting;
													return (
														<div
															key={doc.id}
															className="ml-4 border-border border-l border-dashed px-2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0"
														>
															<SidebarMenuItem>
																<SidebarMenuButton
																	asChild
																	tooltip={doc.name}
																	data-active={
																		pathname.split("/").at(-1) === doc.id
																	}
																	className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground text-sm hover:bg-accent hover:text-accent-foreground group-data-[collapsible=icon]:justify-center"
																	style={{ opacity: isDocPending ? 0.7 : 1 }}
																>
																	<Link
																		href={`/docs/${doc.id}`}
																		className="flex w-full items-center gap-2"
																	>
																		<FileText className="h-4 w-4 shrink-0" />
																		<span className="truncate group-data-[collapsible=icon]:hidden">
																			{doc.name}
																		</span>
																	</Link>
																</SidebarMenuButton>
																<DropdownMenu>
																	<DropdownMenuTrigger asChild>
																		<SidebarMenuAction
																			disabled={isDocPending} // Disable trigger if pending
																		>
																			{isDocPending ? (
																				<Loader2 className="h-4 w-4 animate-spin" />
																			) : (
																				<MoreHorizontal className="h-4 w-4" />
																			)}
																		</SidebarMenuAction>
																	</DropdownMenuTrigger>
																	<DropdownMenuContent
																		side="right"
																		align="start"
																	>
																		<DropdownMenuItem
																			onClick={() =>
																				handleExport(doc.id, doc.name)
																			}
																			disabled={isExporting}
																			className="flex cursor-pointer items-center gap-2"
																		>
																			{isDocBeingExported ? (
																				<Loader2 className="h-4 w-4 animate-spin" />
																			) : (
																				<Download className="h-4 w-4" />
																			)}
																			<span>Export Markdown</span>
																		</DropdownMenuItem>
																		<DropdownMenuSeparator />
																		<DropdownMenuItem
																			onClick={() =>
																				handleDelete(doc.id, doc.name)
																			}
																			disabled={isDeleting}
																			className="flex cursor-pointer items-center gap-2"
																		>
																			{isDocBeingDeleted ? (
																				<Loader2 className="h-4 w-4 animate-spin" />
																			) : (
																				<Trash2 className="h-4 w-4" />
																			)}
																			<span>Delete Document</span>
																		</DropdownMenuItem>
																	</DropdownMenuContent>
																</DropdownMenu>
															</SidebarMenuItem>
														</div>
													);
												})}
											</div>
										</ScrollArea>
									</CollapsibleContent>
								</Collapsible>
							</SidebarMenuItem>

							<SidebarMenuItem>
								<Collapsible defaultOpen={true} className="w-full">
									<CollapsibleTrigger asChild>
										<SidebarMenuButton
											tooltip="Integrations"
											className="flex w-full items-center gap-2 px-2 py-1.5 text-muted-foreground text-sm hover:bg-accent hover:text-foreground group-data-[collapsible=icon]:justify-center"
											id={TOUR_STEP_IDS.INTEGRATIONS}
										>
											<Settings className="h-4 w-4 shrink-0" />
											<span className="truncate font-medium tracking-wide group-data-[collapsible=icon]:hidden">
												Integrations
											</span>
											<ChevronDown className="ml-auto h-4 w-4 shrink-0 transition-transform group-data-[collapsible=icon]:hidden group-data-[state=open]/collapsible:rotate-180" />
										</SidebarMenuButton>
									</CollapsibleTrigger>
									<CollapsibleContent>
										<div className="space-y-1 py-1">
											{integrations.map((integration) => (
												<div
													key={integration.name}
													className={cn(
														"ml-4 border-border border-l border-dashed px-2 group-data-[collapsible=icon]:ml-0 group-data-[collapsible=icon]:px-0",
														{
															"cursor-not-allowed opacity-50":
																integration.disabled,
														},
													)}
												>
													{!integration.disabled && (
														<SidebarMenuButton
															asChild
															tooltip={integration.name}
															className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-muted-foreground text-sm hover:bg-accent hover:text-accent-foreground group-data-[collapsible=icon]:justify-center"
														>
															<Link href={integration.link}>
																<integration.icon className="h-4 w-4 shrink-0" />
																<span className="truncate group-data-[collapsible=icon]:hidden">
																	{integration.name}
																</span>
															</Link>
														</SidebarMenuButton>
													)}
												</div>
											))}
											<div>
												<SidebarMenuButton
													asChild
													tooltip="View all integrations"
													className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 font-medium text-primary text-sm brightness-150 hover:bg-muted group-data-[collapsible=icon]:justify-center"
												>
													<Link href="/integrations">
														<Merge className="h-4 w-4 shrink-0" />
														<span className="truncate group-data-[collapsible=icon]:hidden">
															View all integrations
														</span>
													</Link>
												</SidebarMenuButton>
											</div>
										</div>
									</CollapsibleContent>
								</Collapsible>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>

					{/* User/Sign In Buttons at Bottom */}
					<SidebarGroup className="mt-auto pb-2">
						<SidebarMenu>
							<SidebarMenuItem>
								<SignedIn>
									<SidebarMenuButton
										className="!p-0 group-data-[collapsible=icon]:!p-0 flex w-full items-center justify-start gap-2 text-foreground text-sm transition-colors hover:bg-muted/50"
										tooltip="User Profile"
										asChild
									>
										<UserButton showName={true} />
									</SidebarMenuButton>
								</SignedIn>
								<SignedOut>
									<SignInButton mode="modal">
										<SidebarMenuButton
											className={cn(
												"flex h-10 w-full items-center justify-center gap-1.5 rounded-sm px-2 py-1 font-medium text-base transition-colors duration-150",
												"active:!bg-sidebar-accent/60 active:!text-foreground bg-sidebar-accent text-foreground hover:bg-sidebar-accent/80 hover:text-foreground",
												"group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:text-[10px]",
												"aria-label:Sign in to your account",
											)}
										>
											<LogIn className="h-6 w-6 shrink-0" />
											<span className="group-data-[collapsible=icon]:hidden">
												Sign In
											</span>
										</SidebarMenuButton>
									</SignInButton>
								</SignedOut>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroup>
				</SidebarContent>
				<SidebarRail />
			</Sidebar>
		</TooltipProvider>
	);
}
