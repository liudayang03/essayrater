import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, FileText, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { toast } from 'sonner';

type Example = {
  original: string;
  issue: string;
  suggestion: string;
  reason: string;
  comparison: string;
};

type Standard = {
  standardName: string;
  score: number;
  maxScore: number;
  problem: string;
  examples: Example[];
};

type Category = {
  categoryName: string;
  score: number;
  maxScore: number;
  standards: Standard[];
};

type EvaluationResult = {
  totalScore: number;
  deductPoints: number;
  overallSummary: string;
  categories: Category[];
};

export default function Home() {
  const [essay, setEssay] = useState('');
  const [result, setResult] = useState<EvaluationResult | null>(null);

  const evaluateMutation = trpc.essay.evaluate.useMutation({
    onSuccess: (data) => {
      setResult(data);
      toast.success('评估完成！');
    },
    onError: (error) => {
      console.error(error);
      toast.error('评估失败，请重试');
    },
  });

  const handleEvaluate = () => {
    if (!essay.trim()) {
      toast.error('请输入文书内容');
      return;
    }
    evaluateMutation.mutate({ essay });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                美国大学申请文书评估系统
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          {/* 左边输入 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-600" />
                  输入文书
                </CardTitle>
                <CardDescription>粘贴或输入您的申请文书内容</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="请在此输入您的文书内容..."
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  className="min-h-[500px] resize-none"
                />
                <Button
                  onClick={handleEvaluate}
                  disabled={evaluateMutation.isPending}
                  size="lg"
                  className="w-full"
                >
                  {evaluateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      评估中...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      开始评估
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右边结果 */}
          <div className="space-y-6">
            {result ? (
              <>
                {/* 总分 */}
                <Card>
                  <CardHeader>
                    <CardTitle>评估结果</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      距离{result.totalScore + result.deductPoints}分还差{result.deductPoints}分
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{result.overallSummary}</p>
                  </CardContent>
                </Card>

                {/* 五大类 */}
                {result.categories.map((category, catIndex) => (
                  <Card key={catIndex} className="border-red-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <AlertCircle className="w-5 h-5" />
                        {category.categoryName}
                        <span className="text-sm font-normal ml-2">
                          {category.score}/{category.maxScore}分
                        </span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {category.standards.map((standard, stdIndex) => (
                          <div
                            key={stdIndex}
                            className="space-y-3 p-4 border-l-4 border-red-500 bg-red-50 rounded-r-lg"
                          >
                            <div className="flex justify-between items-start">
                              <h4 className="text-sm font-semibold text-red-900">
                                {standard.standardName}
                              </h4>
                              <span className="text-sm text-red-700">
                                {standard.score}/{standard.maxScore}分
                              </span>
                            </div>
                            <p className="text-sm text-red-800">{standard.problem}</p>

                            {standard.examples.map((example, exIndex) => (
                              <div key={exIndex} className="space-y-2 p-3 bg-red-50/50 rounded border border-red-200">
                                <div className="text-sm text-red-900">
                                  <span className="font-medium">原文：</span>
                                  <span className="italic">"{example.original}"</span>
                                </div>
                                <div className="text-sm text-red-800">
                                  <span className="font-medium">问题：</span>
                                  {example.issue}
                                </div>
                                <div className="text-sm text-red-800">
                                  <span className="font-medium">建议：</span>
                                  {example.suggestion}
                                </div>
                                <div className="text-sm text-red-700">
                                  <span className="font-medium">原因：</span>
                                  {example.reason}
                                </div>
                                <div className="text-sm text-red-700">
                                  <span className="font-medium">效果对比：</span>
                                  {example.comparison}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            ) : (
              <Card className="lg:sticky lg:top-24">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">等待评估</h3>
                  <p className="text-sm text-muted-foreground max-w-sm">
                    请在左侧输入文书内容，然后点击"开始评估"按钮
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}