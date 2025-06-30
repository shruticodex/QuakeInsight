"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function MagnitudePredictionFeature() {
  const predictionTypes = [
    {
      id: "linear",
      title: "Linear Regression Prediction",
      description:
        "A simple yet effective statistical method that models the relationship between earthquake features and magnitude as a linear equation.",
      methodology:
        "Linear regression finds the best-fitting line through the data points by minimizing the sum of squared differences between observed and predicted values. For earthquake magnitude prediction, features like depth, location, and historical seismic activity are used as predictors.",
      applications:
        "Useful for establishing baseline predictions and understanding the linear relationships between earthquake parameters. Provides interpretable results that can help identify which factors most strongly influence magnitude.",
      image: "/mp1_imresizer.png?height=300&width=500",
    },
    {
      id: "svm",
      title: "SVM Prediction",
      description:
        "Support Vector Machine (SVM) is a powerful machine learning algorithm that can model complex, non-linear relationships in earthquake data.",
      methodology:
        "SVM works by finding the optimal hyperplane that maximizes the margin between different classes or values. For magnitude prediction, it uses a kernel function to transform the input features into a higher-dimensional space where the relationship may be more easily modeled.",
      applications:
        "Particularly effective when the relationship between earthquake parameters and magnitude is complex and non-linear. SVMs are robust to outliers, making them suitable for earthquake data which often contains anomalous events.",
      image: "/mp2_imresizer.png?height=300&width=500",
    },
    {
      id: "naive",
      title: "Naive Bayes Prediction",
      description:
        "A probabilistic classifier based on Bayes' theorem that assumes independence between features, providing fast and efficient predictions.",
      methodology:
        "Naive Bayes calculates the probability of different magnitude ranges based on the observed features, using Bayes' theorem. Despite its 'naive' assumption of feature independence, it often performs surprisingly well on real-world data.",
      applications:
        "Useful for rapid preliminary assessments and when computational resources are limited. Works well when the training dataset is relatively small, which can be the case for region-specific earthquake studies.",
      image: "/mp3_imresizer.png?height=300&width=500",
    },
    {
      id: "random",
      title: "Random Forest Prediction",
      description:
        "An ensemble learning method that combines multiple decision trees to create a more accurate and robust prediction model.",
      methodology:
        "Random Forest builds numerous decision trees using random subsets of the data and features. Each tree makes a prediction, and the final output is the average (for regression) or majority vote (for classification) of all trees. This reduces overfitting and improves generalization.",
      applications:
        "Excellent for capturing complex, non-linear patterns in earthquake data. Provides feature importance rankings, helping researchers understand which factors most strongly influence magnitude predictions. Robust to noise and outliers in the data.",
      image: "/mp4_imresizer.png?height=300&width=500",
    },
    {
      id: "lstm",
      title: "LSTM Neural Network",
      description:
        "Long Short-Term Memory networks are specialized deep learning models designed to capture temporal patterns and long-range dependencies in sequential data.",
      methodology:
        "LSTMs use a complex architecture with memory cells that can learn to retain or forget information over long sequences. For earthquake prediction, they can process time series of seismic activity, capturing patterns that evolve over time and potentially identifying precursory signals.",
      applications:
        "Particularly valuable for incorporating the temporal evolution of seismic activity into predictions. Can potentially identify subtle precursory patterns that simpler models might miss. Useful for real-time monitoring systems where predictions are continuously updated as new data arrives.",
      image: "/mp5_imresizer.png?height=300&width=500",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/features">
          <Button variant="outline" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Features
          </Button>
        </Link>
        <motion.h1
          className="text-4xl font-bold mb-4 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Earthquake Magnitude Prediction
        </motion.h1>
        <motion.p
          className="text-xl text-muted-foreground text-center max-w-3xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Advanced machine learning algorithms to predict earthquake magnitudes based on historical data and real-time
          seismic signals
        </motion.p>
      </div>

      <Tabs defaultValue="linear" className="w-full">
        <TabsList className="grid grid-cols-5 mb-8">
          {predictionTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id}>
              {type.id === "lstm" ? "LSTM" : type.title.split(" ")[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        {predictionTypes.map((type) => (
          <TabsContent key={type.id} value={type.id}>
            <Card>
              <CardHeader>
                <CardTitle>{type.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-muted-foreground mb-4">{type.description}</p>

                    <h3 className="text-lg font-semibold mb-2">Methodology</h3>
                    <p className="text-muted-foreground mb-4">{type.methodology}</p>

                    <h3 className="text-lg font-semibold mb-2">Applications</h3>
                    <p className="text-muted-foreground">{type.applications}</p>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="relative w-full h-[300px] rounded-lg overflow-hidden">
                      <Image
                        src={type.image || "/placeholder.svg"}
                        alt={`${type.title} visualization`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 text-center">Example of {type.title} results</p>
                  </div>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-2">Try It Yourself</h3>
                  <p className="text-muted-foreground mb-4">
                    Experience this prediction algorithm with real earthquake data from the USGS or upload your own
                    dataset.
                  </p>
                  <Link href="/research">
                    <Button>Go to Research Page</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

