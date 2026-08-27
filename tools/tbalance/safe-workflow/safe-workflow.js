(() => {
  "use strict";

  const SAFE_WORKFLOW_VERSION = "0.1";
  const STEP_ORDER = ["analyze", "confirm", "change", "review", "apply"];
  const STEP_LABELS = {
    analyze: "Analyze",
    confirm: "Confirm",
    change: "Change",
    review: "Review",
    apply: "Apply",
  };

  function buildSafeWorkflowState(context = {}) {
    const analyzer = context.analyzer || {};
    const pageMeta = context.pageMeta || {};
    const visibleMappings = Array.isArray(context.visibleMappings) ? context.visibleMappings : [];
    const selectedMapping = context.selectedMapping || visibleMappings[0] || null;
    const selectedElement = context.selectedElement || null;
    const safeChange = analyzer.safeChange || {};
    const safePatch = analyzer.safePatch || {};
    const safeApply = analyzer.safeApply || {};
    const candidate = safePatch.candidate || null;
    const change = getInstructionChange(safeChange.json);
    const changeStale = Boolean(safeChange.json && selectedMapping && !instructionTargetsMapping(safeChange.json, selectedMapping, pageMeta));

    const steps = {
      analyze: buildAnalyzeStep(analyzer),
      confirm: buildConfirmStep(visibleMappings, selectedMapping, selectedElement),
      change: buildChangeStep(safeChange, selectedMapping, change, changeStale),
      review: null,
      apply: null,
    };
    steps.review = buildReviewStep(safePatch, candidate, steps.change.status === "complete");
    steps.apply = buildApplyStep(safePatch, safeApply, candidate);
    const currentStep = chooseCurrentStep(steps);
    const nextAction = buildNextAction(currentStep, steps, {
      safeChange,
      safePatch,
      safeApply,
      candidate,
    });

    return {
      version: SAFE_WORKFLOW_VERSION,
      currentStep,
      overallStatus: steps.apply.status === "complete" ? "applied" : steps[currentStep]?.status || "not-ready",
      steps,
      target: buildTargetSummary(pageMeta, selectedMapping, selectedElement),
      change: buildChangeSummary(safeChange, change, changeStale),
      review: buildReviewSummary(safePatch, candidate),
      apply: buildApplySummary(safeApply),
      context: {
        adapterLabel: context.adapter?.label || "None",
        adapterId: context.adapter?.id || "none",
        manifest: context.manifest || null,
      },
      nextAction,
    };
  }

  function buildAnalyzeStep(analyzer) {
    if (analyzer.result?.elements?.length) {
      return { status: "complete", label: STEP_LABELS.analyze, message: "解析済み" };
    }
    if (analyzer.loadedPath || analyzer.effectiveUrl) {
      return { status: "current", label: STEP_LABELS.analyze, message: "Analyzeを実行してください" };
    }
    return { status: "not-ready", label: STEP_LABELS.analyze, message: "Existing Pageを読み込んでください" };
  }

  function buildConfirmStep(visibleMappings, selectedMapping, selectedElement) {
    if (selectedMapping) {
      return { status: "complete", label: STEP_LABELS.confirm, message: "Confirmed Mappingあり" };
    }
    if (selectedElement) {
      return { status: "current", label: STEP_LABELS.confirm, message: "選択ElementをConfirmしてください" };
    }
    if (visibleMappings.length) {
      return { status: "ready", label: STEP_LABELS.confirm, message: "Mappingを選択してください" };
    }
    return { status: "not-ready", label: STEP_LABELS.confirm, message: "Analyzer Candidateが必要です" };
  }

  function buildChangeStep(safeChange, selectedMapping, change, changeStale) {
    if (!selectedMapping) {
      return { status: "not-ready", label: STEP_LABELS.change, message: "Confirmed Mappingが必要です" };
    }
    if (changeStale) {
      return { status: "blocked", label: STEP_LABELS.change, reason: "stale", message: "Safe ChangeのTargetが現在のMappingと一致しません" };
    }
    if (safeChange.json && change && safeChange.status !== "error") {
      return { status: "complete", label: STEP_LABELS.change, message: "Safe Change Instruction生成済み" };
    }
    return { status: "current", label: STEP_LABELS.change, message: "変更内容を指定してください" };
  }

  function buildReviewStep(safePatch, candidate, changeComplete) {
    if (!candidate) {
      if (safePatch.status === "error") {
        return { status: "blocked", label: STEP_LABELS.review, message: safePatch.message || "Patch Candidate未生成" };
      }
      return {
        status: changeComplete ? "current" : "not-ready",
        label: STEP_LABELS.review,
        message: changeComplete ? "Patch Candidateを生成してください" : "Patch Candidate未生成",
      };
    }
    if (candidate.status === "blocked" || safePatch.status === "blocked") {
      return {
        status: "blocked",
        label: STEP_LABELS.review,
        reason: candidate.blockReason?.code || "blocked",
        message: candidate.blockReason?.message || safePatch.message || "Patch CandidateがBlockedです",
      };
    }
    if (candidate.status === "ready-for-review" && safePatch.reviewStatus === "approved") {
      return { status: "complete", label: STEP_LABELS.review, message: "変更候補を承認済み" };
    }
    if (safePatch.reviewStatus === "rejected") {
      return { status: "current", label: STEP_LABELS.review, reason: "rejected", message: "CandidateはReject済みです" };
    }
    return { status: "current", label: STEP_LABELS.review, message: "Candidateを確認してApproveまたはRejectしてください" };
  }

  function buildApplyStep(safePatch, safeApply, candidate) {
    if (!candidate || candidate.status === "blocked" || safePatch.reviewStatus !== "approved") {
      return { status: "not-ready", label: STEP_LABELS.apply, message: "Approved Candidateが必要です" };
    }
    if (safeApply.status === "applied") {
      return { status: "complete", label: STEP_LABELS.apply, message: "Sourceへ適用済み" };
    }
    if (["failed", "preflight-blocked", "source-changed", "validation-failed", "rollback-failed"].includes(safeApply.status)) {
      return { status: "blocked", label: STEP_LABELS.apply, reason: safeApply.status, message: safeApply.message || "Applyできません" };
    }
    if (safeApply.status === "ready-to-apply" && safeApply.preflight?.ok) {
      return { status: "current", label: STEP_LABELS.apply, message: "Final Confirmation後にSourceへ適用できます" };
    }
    if (safeApply.status === "cancelled") {
      return { status: "current", label: STEP_LABELS.apply, reason: "cancelled", message: "Applyはキャンセルされました" };
    }
    return { status: "ready", label: STEP_LABELS.apply, message: "Apply Preflightを実行してください" };
  }

  function chooseCurrentStep(steps) {
    for (const key of STEP_ORDER) {
      if (steps[key]?.status === "blocked") {
        return key;
      }
      if (!["complete"].includes(steps[key]?.status)) {
        return key;
      }
    }
    return "apply";
  }

  function buildNextAction(currentStep, steps, context) {
    const step = steps[currentStep] || {};
    if (step.status === "blocked") {
      return {
        type: `${currentStep}-blocked`,
        message: `停止理由: ${step.reason || "blocked"}。${step.message || "前のStepへ戻って内容を確認してください。"}`,
      };
    }
    if (currentStep === "analyze") {
      return { type: "open-analyze", message: "次の操作: Existing Pageを読み込み、Analyzeを実行してください。" };
    }
    if (currentStep === "confirm") {
      return { type: "open-confirm", message: "次の操作: 対象Elementを選択してConfirmed Mappingにしてください。" };
    }
    if (currentStep === "change") {
      return { type: "open-change", message: "次の操作: 変更内容をSafe Changeで指定してください。" };
    }
    if (currentStep === "review") {
      if (!context.candidate) {
        return { type: "open-review", message: "次の操作: Patch Candidateを生成してください。" };
      }
      if (context.safePatch.reviewStatus === "rejected") {
        return { type: "review-rejected", message: "次の操作: 変更内容またはPatch Candidateを確認してください。" };
      }
      return { type: "open-review", message: "次の操作: 変更候補を確認してApproveまたはRejectしてください。" };
    }
    if (currentStep === "apply") {
      if (context.safeApply.status === "applied") {
        return { type: "applied", message: "適用済みです。Commit / Push / Publishは別作業です。" };
      }
      if (context.safeApply.status === "ready-to-apply") {
        return { type: "final-confirm", message: "次の操作: Final Confirmationを確認して実Sourceへ適用してください。" };
      }
      if (context.safeApply.status === "cancelled") {
        return { type: "apply-cancelled", message: "次の操作: 必要ならPreflightを再確認してApplyしてください。" };
      }
      return { type: "open-apply", message: "次の操作: Apply Preflightを実行してください。" };
    }
    return { type: "complete", message: "Safe Source Editing FlowはAppliedです。Commit / Push / Publishは別作業です。" };
  }

  function buildTargetSummary(pageMeta, selectedMapping, selectedElement) {
    return {
      pageId: selectedMapping?.pageId || pageMeta.pageId || "Not selected",
      sourcePath: selectedMapping?.page?.sourcePath || pageMeta.sourcePath || "",
      viewState: selectedMapping?.viewState || pageMeta.currentViewState || "",
      tbId: selectedMapping?.tbId || "",
      domRef: selectedMapping?.domRef || selectedElement?.observed?.selector || "",
      selectedLabel: selectedElement?.observed?.tag || "",
      hasConfirmedMapping: Boolean(selectedMapping),
    };
  }

  function buildChangeSummary(safeChange, change, changeStale) {
    return {
      status: safeChange.status || "idle",
      stale: changeStale,
      intent: safeChange.json?.userIntent || safeChange.intent || "",
      property: change?.property || safeChange.property || "",
      before: change?.before ?? safeChange.beforeText ?? "",
      after: change?.after ?? safeChange.afterText ?? "",
      beforeSource: change?.beforeSource || safeChange.beforeSource || "",
    };
  }

  function buildReviewSummary(safePatch, candidate) {
    const source = candidate?.sourcePatch?.source || candidate?.sourceRef || {};
    const change = candidate?.semanticDiff?.[0] || null;
    return {
      status: candidate?.status || safePatch.status || "idle",
      reason: candidate?.blockReason?.code || "",
      message: candidate?.blockReason?.message || safePatch.message || "",
      reviewStatus: safePatch.reviewStatus || candidate?.review?.status || "",
      source: source.path || source.href || "",
      change: change ? `${change.property}: ${stringifyValue(change.before)} -> ${stringifyValue(change.after)}` : "",
    };
  }

  function buildApplySummary(safeApply) {
    return {
      status: safeApply.status || "idle",
      message: safeApply.message || "",
      preflight: safeApply.preflight?.ok ? "Passed" : (safeApply.status === "checking" ? "Checking" : "Not yet"),
      result: safeApply.result?.status || "",
    };
  }

  function instructionTargetsMapping(instruction, mapping, pageMeta) {
    const target = instruction?.target || {};
    return target.pageId === mapping.pageId
      && target.tbId === mapping.tbId
      && target.domRef === mapping.domRef
      && (target.viewState || "") === (mapping.viewState || "")
      && (target.sourcePath || "") === (mapping.page?.sourcePath || pageMeta.sourcePath || "");
  }

  function getInstructionChange(instruction) {
    return instruction?.changes?.[0] || null;
  }

  function stringifyValue(value) {
    if (value == null) {
      return "-";
    }
    if (typeof value === "string") {
      return value;
    }
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }

  window.TBalanceSafeWorkflow = {
    SAFE_WORKFLOW_VERSION,
    STEP_ORDER: [...STEP_ORDER],
    buildSafeWorkflowState,
  };
})();
